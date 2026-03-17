const Appointment = require("../../models/Appointment/appointment");
const User = require("../../models/User/user");
const UserPet = require("../../models/UserPet/userPet");
const { isValidObjectId } = require("mongoose");
const {
  autoCancelUnansweredAppointments,
  isWithinBookingWindow,
  BOOKING_WINDOW_DAYS,
} = require("./utils");

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const toTitleCase = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const toIdString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value._id?.toString) return value._id.toString();
    if (value.toString) return value.toString();
  }
  return "";
};

const normalizeTimeTo24h = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const amPmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hours = Number(amPmMatch[1]);
    const minutes = Number(amPmMatch[2]);
    const meridiem = amPmMatch[3].toUpperCase();

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "";
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) return "";

    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  const hhmmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (hhmmMatch) {
    const hours = Number(hhmmMatch[1]);
    const minutes = Number(hhmmMatch[2]);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return "";
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return "";

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  return "";
};

const findBestPetMatch = (ownerPets = [], petName, petType) => {
  const targetName = normalizeText(petName);
  const targetType = normalizeText(petType);

  if (!targetName || !ownerPets.length) return null;

  const exactMatches = ownerPets.filter(
    (pet) =>
      normalizeText(pet.name) === targetName &&
      (!targetType || normalizeText(pet.species) === targetType),
  );
  if (exactMatches.length === 1) return exactMatches[0];
  if (exactMatches.length > 1) {
    return exactMatches.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    )[0];
  }

  const nameOnlyMatches = ownerPets.filter(
    (pet) => normalizeText(pet.name) === targetName,
  );
  if (!nameOnlyMatches.length) return null;

  return nameOnlyMatches.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  )[0];
};

const getUserAppointments = async (req, res) => {
  try {
    await autoCancelUnansweredAppointments();

    const filter = { user: req.user._id };
    if (req.query.petId) {
      const { isValidObjectId } = require("mongoose");
      if (!isValidObjectId(req.query.petId)) {
        return res.status(400).json({ message: "Invalid pet ID" });
      }
      filter.petId = req.query.petId;
    }

    const appointments = await Appointment.find(filter)
      .populate("providerId", "name avatar role roleData")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    console.error(
      "Error in server/controllers/appointment/get.js (getUserAppointments):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    await autoCancelUnansweredAppointments();

    const appointments = await Appointment.find()
      .populate("user", "name email phone")
      .populate("providerId", "name avatar role roleData")
      .populate(
        "petId",
        "name species breed age dob gender weight profileImage",
      )
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    console.error(
      "Error in server/controllers/appointment/get.js (getAllAppointments):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getProviderAppointments = async (req, res) => {
  try {
    await autoCancelUnansweredAppointments();

    const userId = req.user._id;
    const role = req.user.role;
    const user = await User.findById(userId);

    let allProviderIds = [userId];
    if (role === "hospital" && user.roleData?.hospitalDoctorIds) {
      allProviderIds = [...allProviderIds, ...user.roleData.hospitalDoctorIds];
    } else if (role === "daycare" && user.roleData?.daycareStaffIds) {
      allProviderIds = [...allProviderIds, ...user.roleData.daycareStaffIds];
    }

    const appointments = await Appointment.find({
      $or: [{ providerId: { $in: allProviderIds } }, { user: userId }],
    })
      .populate("user", "name email phone avatar")
      .populate("providerId", "name avatar role roleData")
      .populate("petId", "name species breed age dob gender weight")
      .populate(
        "enquiryPetId",
        "name species breed type available images profileImage _id shopId ngoId",
      )
      .sort({ createdAt: -1 });

    const appointmentPayload = appointments.map((appointment) =>
      appointment.toObject(),
    );

    const appointmentsMissingPetLink = appointmentPayload.filter(
      (appointment) => {
        const resolvedPetId = toIdString(appointment.petId);
        const ownerId = toIdString(appointment.user);
        return !resolvedPetId && ownerId && appointment.petName;
      },
    );

    if (appointmentsMissingPetLink.length > 0) {
      const ownerIds = [
        ...new Set(
          appointmentsMissingPetLink
            .map((appointment) => toIdString(appointment.user))
            .filter(Boolean),
        ),
      ];

      const pets = await UserPet.find({
        owner: { $in: ownerIds },
        status: { $ne: "archived" },
      }).select(
        "_id owner name species breed age dob gender weight profileImage petId updatedAt",
      );

      const petsByOwner = new Map();
      pets.forEach((pet) => {
        const ownerId = toIdString(pet.owner);
        if (!petsByOwner.has(ownerId)) {
          petsByOwner.set(ownerId, []);
        }
        petsByOwner.get(ownerId).push(pet);
      });

      appointmentPayload.forEach((appointment) => {
        const explicitPetId = toIdString(appointment.petId);
        if (explicitPetId) {
          appointment.resolvedPetId = explicitPetId;
          return;
        }

        const ownerId = toIdString(appointment.user);
        const ownerPets = petsByOwner.get(ownerId) || [];
        const matchedPet = findBestPetMatch(
          ownerPets,
          appointment.petName,
          appointment.petType,
        );

        if (matchedPet) {
          appointment.petId = matchedPet;
          appointment.resolvedPetId = toIdString(matchedPet._id);
        } else {
          appointment.resolvedPetId = "";
        }
      });
    } else {
      appointmentPayload.forEach((appointment) => {
        appointment.resolvedPetId = toIdString(appointment.petId);
      });
    }

    res.json(appointmentPayload);
  } catch (error) {
    console.error(
      "Error in server/controllers/appointment/get.js (getProviderAppointments):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getProviderBookedSlots = async (req, res) => {
  try {
    await autoCancelUnansweredAppointments();

    const { providerId, date } = req.query;

    if (!providerId || !date) {
      return res
        .status(400)
        .json({ message: "providerId and date are required" });
    }

    if (!isValidObjectId(providerId)) {
      return res.status(400).json({ message: "Invalid providerId" });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const provider = await User.findById(providerId).select(
      "availability.days role",
    );
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const providerRole = String(provider?.role || "")
      .trim()
      .toLowerCase();
    const shouldBlockDateOnConfirmed =
      providerRole === "caretaker" || providerRole === "daycare";
    const slotBlockingStatuses = shouldBlockDateOnConfirmed
      ? ["confirmed"]
      : ["pending", "confirmed"];

    const providerAvailableDays = Array.isArray(provider?.availability?.days)
      ? provider.availability.days
      : [];
    if (!isWithinBookingWindow(parsedDate, providerAvailableDays)) {
      return res.status(400).json({
        message: `Bookings are available only for the next ${BOOKING_WINDOW_DAYS} days.`,
      });
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    const bookedAppointments = await Appointment.find({
      providerId,
      status: { $in: slotBlockingStatuses },
      $or: [
        { date: { $gte: startOfDay, $lt: endOfDay } },
        { selectedDates: { $elemMatch: { $gte: startOfDay, $lt: endOfDay } } },
      ],
    }).select("time status");

    const hasConfirmedBookingOnDate =
      shouldBlockDateOnConfirmed &&
      bookedAppointments.some(
        (appointment) =>
          String(appointment?.status || "").toLowerCase() === "confirmed",
      );

    const slots = [
      ...new Set(
        bookedAppointments
          .map((appointment) => normalizeTimeTo24h(appointment.time))
          .filter(Boolean),
      ),
    ];

    return res.json({
      providerId,
      date: startOfDay.toISOString(),
      slots,
      isDateBlocked: hasConfirmedBookingOnDate,
      blockedBy: hasConfirmedBookingOnDate ? "confirmed" : null,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/appointment/get.js (getProviderBookedSlots):",
      error,
    );
    return res.status(500).json({ message: error.message });
  }
};

const getPetHistoryForProvider = async (req, res) => {
  try {
    const { petId } = req.params;
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(petId)) {
      return res.status(400).json({ message: "Invalid pet ID" });
    }

    const pet = await UserPet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    if (pet.owner.toString() !== req.user._id.toString()) {
      const role = req.user.role;
      const allowedRoles = [
        "doctor",
        "hospital",
        "caretaker",
        "daycare",
        "shop",
        "ngo",
      ];
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const user = await User.findById(req.user._id).select("role roleData");
      let providerIds = [req.user._id];
      if (role === "hospital" && user?.roleData?.hospitalDoctorIds) {
        providerIds = [...providerIds, ...user.roleData.hospitalDoctorIds];
      } else if (role === "daycare" && user?.roleData?.daycareStaffIds) {
        providerIds = [...providerIds, ...user.roleData.daycareStaffIds];
      }

      const hasAccess = await Appointment.exists({
        petId,
        providerId: { $in: providerIds },
      });

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const history = await Appointment.find({ petId })
      .populate("providerId", "name role roleData")
      .sort({ date: -1 });

    res.json({ pet, history });
  } catch (error) {
    console.error(
      "Error in server/controllers/appointment/get.js (getPetHistoryForProvider):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const ensureAppointmentPetProfile = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "petId",
    );
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const requesterId = toIdString(req.user?._id);
    const appointmentUserId = toIdString(appointment.user);
    const appointmentProviderId = toIdString(appointment.providerId);
    const isAdmin = req.user?.role === "admin";

    let allowedProviderIds = [requesterId];
    if (
      req.user?.role === "hospital" &&
      Array.isArray(req.user?.roleData?.hospitalDoctorIds)
    ) {
      allowedProviderIds = [
        ...allowedProviderIds,
        ...req.user.roleData.hospitalDoctorIds.map((id) => id.toString()),
      ];
    } else if (
      req.user?.role === "daycare" &&
      Array.isArray(req.user?.roleData?.daycareStaffIds)
    ) {
      allowedProviderIds = [
        ...allowedProviderIds,
        ...req.user.roleData.daycareStaffIds.map((id) => id.toString()),
      ];
    }

    const isOwnerUser =
      Boolean(requesterId) &&
      Boolean(appointmentUserId) &&
      requesterId === appointmentUserId;
    const isLinkedProvider =
      Boolean(appointmentProviderId) &&
      allowedProviderIds.includes(appointmentProviderId);

    if (!isAdmin && !isOwnerUser && !isLinkedProvider) {
      return res.status(403).json({
        message: "Not authorized to view this pet profile",
      });
    }

    // Safety: Prevent auto-creating UserPet profiles for Shop/Adoption listings
    const normalizedService = String(appointment.service || "").toLowerCase();
    const normalizedProviderType = String(
      appointment.providerType || "",
    ).toLowerCase();
    const isShopOrAdoption =
      ["shop", "pet_adoption", "adoption", "others"].includes(
        normalizedService,
      ) || ["shop", "ngo"].includes(normalizedProviderType);

    if (isShopOrAdoption) {
      return res.status(400).json({
        message:
          "This pet is a shop/adoption listing and cannot be added to your pet profiles automatically.",
      });
    }

    if (appointment.petId) {
      return res.json({
        petId: toIdString(appointment.petId),
        created: false,
      });
    }

    if (!appointmentUserId) {
      return res.status(400).json({
        message: "Cannot create profile: appointment has no owner user",
      });
    }

    const ownerPets = await UserPet.find({
      owner: appointmentUserId,
      status: { $ne: "archived" },
    }).select("_id owner name species updatedAt");

    let linkedPet = findBestPetMatch(
      ownerPets,
      appointment.petName,
      appointment.petType,
    );
    let created = false;

    if (!linkedPet) {
      const speciesRaw = appointment.petType || "Other";
      linkedPet = await UserPet.create({
        owner: appointmentUserId,
        name: appointment.petName || "Pet",
        species: toTitleCase(speciesRaw === "Others" ? "Other" : speciesRaw),
        breed: "Not specified",
        gender: "Unknown",
      });
      created = true;
    }

    appointment.petId = linkedPet._id;
    await appointment.save();

    return res.status(created ? 201 : 200).json({
      petId: toIdString(linkedPet._id),
      created,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/appointment/get.js (ensureAppointmentPetProfile):",
      error,
    );
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserAppointments,
  getAllAppointments,
  getProviderAppointments,
  getProviderBookedSlots,
  getPetHistoryForProvider,
  ensureAppointmentPetProfile,
};
