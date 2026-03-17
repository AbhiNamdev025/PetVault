const Appointment = require("../../models/Appointment/appointment");
const User = require("../../models/User/user");
const UserPet = require("../../models/UserPet/userPet");
const Pet = require("../../models/Pet/pet");
const { isValidObjectId } = require("mongoose");
const {
  getPlatformFeeConfig,
  getPlatformFeePercent,
  roundCurrency,
} = require("../../utils/platformFee");
const {
  clampCoinsForAmount,
  spendCoins,
  toRupees,
  MAX_SPEND_PERCENT,
  MAX_SPEND_COINS,
  COIN_RATE,
} = require("../../utils/coins");
const {
  BOOKING_WINDOW_DAYS,
  normalizeTimeTo24h,
  isWithinBookingWindow,
  autoCancelUnansweredAppointments,
} = require("./utils");
const MAX_DAYCARE_SELECTED_DAYS = 4;

const parseBooleanFlag = (value) => {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const toTitleCase = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseMedicalConditions = (rawHealthIssues) =>
  String(rawHealthIssues || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const normalizeAppointmentPaymentMethod = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "online") return "Online";
  return "Cash";
};

const resolvePetSpecies = (petType, otherPetType) => {
  const normalizedPetType = String(petType || "")
    .trim()
    .toLowerCase();
  if (normalizedPetType === "other" || normalizedPetType === "others") {
    const manualType = toTitleCase(otherPetType);
    return manualType || "Other";
  }
  const resolvedType = toTitleCase(petType);
  return resolvedType || "Other";
};

const toStartOfUtcDay = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setUTCHours(0, 0, 0, 0);
  return parsed;
};

const parseSelectedDates = (rawSelectedDates, fallbackDate) => {
  let inputDates = [];

  if (Array.isArray(rawSelectedDates)) {
    inputDates = rawSelectedDates;
  } else if (
    typeof rawSelectedDates === "string" &&
    rawSelectedDates.trim().length > 0
  ) {
    const trimmed = rawSelectedDates.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        inputDates = parsed;
      } else if (typeof parsed === "string" && parsed.trim()) {
        inputDates = [parsed.trim()];
      }
    } catch {
      inputDates = trimmed
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
    }
  }

  const candidates = inputDates.length > 0 ? inputDates : [fallbackDate];
  const uniqueDateMap = new Map();

  for (const dateValue of candidates) {
    const normalizedDate = toStartOfUtcDay(dateValue);
    if (!normalizedDate) {
      return { error: "Invalid selected date" };
    }
    uniqueDateMap.set(normalizedDate.toISOString(), normalizedDate);
  }

  const dates = [...uniqueDateMap.values()].sort((left, right) => left - right);
  return { dates };
};

const createAppointment = async (req, res) => {
  try {
    const {
      providerId,
      providerType,
      service,
      petName,
      petType,
      date,
      time,
      parentPhone,
      reason,
      healthIssues,
      petId,
      enquiryPetId,
      coinsToUse,
      addToMyPets,
      otherPetType,
      selectedDates: rawSelectedDates,
      paymentMethod,
    } = req.body;

    if (
      !providerId ||
      !providerType ||
      !service ||
      !petName ||
      !petType ||
      !date ||
      !parentPhone ||
      !reason
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const serviceType = service?.toLowerCase();
    const normalizedProviderType = providerType?.toLowerCase();
    const isOtherService = serviceType === "others";

    if (!isValidObjectId(providerId)) {
      return res.status(400).json({ message: "Invalid Provider ID" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const shouldAddToMyPets = parseBooleanFlag(addToMyPets);
    let linkedPetId = petId;
    if (petId) {
      const petRecord = await UserPet.findOne({
        _id: petId,
        owner: req.user._id,
        status: { $ne: "archived" },
      }).select("_id");
      if (!petRecord) {
        return res.status(400).json({ message: "Invalid pet selection" });
      }
      linkedPetId = petRecord._id;
    }

    const petImages = req.files?.petImages?.map((f) => f.filename) || [];

    const appointmentDate = new Date(date);
    if (Number.isNaN(appointmentDate.getTime())) {
      return res.status(400).json({ message: "Invalid appointment date" });
    }

    const parsedSelectedDates = parseSelectedDates(
      rawSelectedDates,
      appointmentDate,
    );
    if (parsedSelectedDates.error) {
      return res.status(400).json({ message: parsedSelectedDates.error });
    }
    const selectedDates = parsedSelectedDates.dates;
    const primaryDate = selectedDates[0];

    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    const providerRoleForListing = String(provider?.role || providerType || "")
      .trim()
      .toLowerCase();
    const supportsListingPet = ["shop", "ngo"].includes(providerRoleForListing);
    let resolvedEnquiryPetId = null;

    if (enquiryPetId) {
      if (!supportsListingPet) {
        return res.status(400).json({
          message:
            "Listing pet can be attached only for shop or adoption bookings.",
        });
      }

      if (!isValidObjectId(enquiryPetId)) {
        return res.status(400).json({ message: "Invalid listing pet ID" });
      }

      const listingPet = await Pet.findById(enquiryPetId).select(
        "_id shopId ngoId isArchived",
      );

      if (!listingPet || listingPet.isArchived) {
        return res
          .status(404)
          .json({ message: "Selected listing pet not found" });
      }

      const providerIdString = providerId.toString();
      if (
        providerRoleForListing === "shop" &&
        String(listingPet.shopId || "") !== providerIdString
      ) {
        return res.status(403).json({
          message: "Selected pet does not belong to this shop",
        });
      }

      if (
        providerRoleForListing === "ngo" &&
        String(listingPet.ngoId || "") !== providerIdString
      ) {
        return res.status(403).json({
          message: "Selected pet does not belong to this NGO",
        });
      }

      resolvedEnquiryPetId = listingPet._id;
    }

    const normalizedProviderRole = String(provider?.role || providerType || "")
      .trim()
      .toLowerCase();
    const shouldBlockDateOnConfirmed =
      normalizedProviderRole === "caretaker" ||
      normalizedProviderRole === "daycare";
    if (
      shouldBlockDateOnConfirmed &&
      selectedDates.length > MAX_DAYCARE_SELECTED_DAYS
    ) {
      return res.status(400).json({
        message: `You can book up to ${MAX_DAYCARE_SELECTED_DAYS} days at once.`,
      });
    }
    const requestedTime = String(time || "").trim();
    const resolvedAppointmentTime = shouldBlockDateOnConfirmed
      ? requestedTime || "00:00"
      : requestedTime;
    if (!resolvedAppointmentTime) {
      return res.status(400).json({ message: "Appointment time is required" });
    }
    const conflictingStatuses = shouldBlockDateOnConfirmed
      ? ["confirmed"]
      : ["pending", "confirmed"];
    const providerAvailableDays = Array.isArray(provider?.availability?.days)
      ? provider.availability.days
      : [];
    const hasOutOfWindowDate =
      !isOtherService &&
      selectedDates.some(
        (selectedDate) =>
          !isWithinBookingWindow(selectedDate, providerAvailableDays),
      );
    if (hasOutOfWindowDate) {
      return res.status(400).json({
        message: `Bookings are allowed only for the next ${BOOKING_WINDOW_DAYS} days.`,
      });
    }

    const normalizedTime = normalizeTimeTo24h(resolvedAppointmentTime);
    if (!normalizedTime) {
      return res.status(400).json({ message: "Invalid appointment time" });
    }

    await autoCancelUnansweredAppointments();

    const conflictingDates = [];
    for (const selectedDate of selectedDates) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

      const existingAppointments = await Appointment.find({
        providerId,
        status: { $in: conflictingStatuses },
        $or: [
          { date: { $gte: startOfDay, $lt: endOfDay } },
          {
            selectedDates: { $elemMatch: { $gte: startOfDay, $lt: endOfDay } },
          },
        ],
      }).select("_id time status");

      const hasConflict = shouldBlockDateOnConfirmed
        ? existingAppointments.some(
            (appointment) =>
              String(appointment?.status || "").toLowerCase() === "confirmed",
          )
        : existingAppointments.some(
            (appointment) =>
              normalizeTimeTo24h(appointment.time) === normalizedTime,
          );
      if (hasConflict) {
        conflictingDates.push(startOfDay.toISOString().split("T")[0]);
      }
    }

    if (conflictingDates.length > 0) {
      const conflictMessage = shouldBlockDateOnConfirmed
        ? conflictingDates.length === 1
          ? "Selected date already has a confirmed booking."
          : "One or more selected dates already have confirmed bookings."
        : conflictingDates.length === 1
          ? "Selected time slot is already booked for the selected date."
          : "Selected time slot is already booked on one or more selected dates.";
      return res.status(409).json({
        message: conflictMessage,
        conflictingDates,
      });
    }

    if (
      shouldAddToMyPets &&
      !linkedPetId &&
      req.user?._id &&
      !["shop", "ngo"].includes(String(providerType || "").toLowerCase())
    ) {
      const normalizedPetName = String(petName || "").trim();
      const resolvedSpecies = resolvePetSpecies(petType, otherPetType);

      if (normalizedPetName && resolvedSpecies) {
        const existingPet = await UserPet.findOne({
          owner: req.user._id,
          status: { $ne: "archived" },
          name: {
            $regex: `^${escapeRegex(normalizedPetName)}$`,
            $options: "i",
          },
          species: {
            $regex: `^${escapeRegex(resolvedSpecies)}$`,
            $options: "i",
          },
        }).select("_id");

        if (existingPet) {
          linkedPetId = existingPet._id;
        } else {
          const createdPet = await UserPet.create({
            owner: req.user._id,
            name: normalizedPetName,
            species: resolvedSpecies,
            breed: "Not specified",
            gender: "Unknown",
            profileImage: petImages[0] || "",
            medicalConditions: parseMedicalConditions(healthIssues),
          });
          linkedPetId = createdPet._id;
        }
      }
    }

    // Calculate platform fee (configurable by role)
    const providerFeePerUnit =
      provider?.roleData?.consultationFee ||
      provider?.roleData?.hourlyRate ||
      provider?.roleData?.charges ||
      0;
    const providerRole = provider?.role || normalizedProviderType;
    const isAdoption = serviceType === "pet_adoption" || providerRole === "ngo";
    const isCaretaker = providerRole === "caretaker";
    const shouldScaleFeeBySelectedDays =
      selectedDates.length > 1 &&
      (providerRole === "caretaker" ||
        providerRole === "daycare" ||
        serviceType === "daycare" ||
        serviceType === "boarding");
    const billedDays = shouldScaleFeeBySelectedDays ? selectedDates.length : 1;
    const providerFee = roundCurrency(providerFeePerUnit * billedDays);
    const isOnlineEligible =
      ["doctor", "hospital", "caretaker", "daycare"].includes(providerRole) ||
      ["vet", "daycare", "grooming", "training", "boarding"].includes(
        serviceType,
      );
    const requestedPaymentMethod =
      normalizeAppointmentPaymentMethod(paymentMethod);
    const resolvedPaymentMethod =
      isOnlineEligible && requestedPaymentMethod === "Online"
        ? "Online"
        : "Cash";
    const feeConfig = await getPlatformFeeConfig();
    const feePercent = getPlatformFeePercent(
      provider?.role || providerType,
      feeConfig,
    );
    const platformFee = roundCurrency((providerFee * feePercent) / 100);
    const originalAmount = roundCurrency(providerFee + platformFee);

    const requestedCoins = Math.max(0, Number(coinsToUse) || 0);
    const maxCoinsByAmount = clampCoinsForAmount(
      requestedCoins,
      originalAmount,
    );
    const maxCoinsByPercent = Math.floor(
      Math.max(0, originalAmount) * (MAX_SPEND_PERCENT / 100) * COIN_RATE,
    );
    const availableCoins = Math.max(0, Number(user?.coins) || 0);
    const coinsUsed = Math.min(
      availableCoins,
      maxCoinsByAmount,
      maxCoinsByPercent,
      MAX_SPEND_COINS,
    );
    const coinsValue = toRupees(coinsUsed);
    const totalAmount = roundCurrency(Math.max(0, originalAmount - coinsValue));
    const isOnlineWithoutGatewayAmount =
      resolvedPaymentMethod === "Online" && totalAmount <= 0;
    const initialPaymentStatus = isOnlineWithoutGatewayAmount
      ? "paid"
      : "pending";
    const initialStatus = isOnlineWithoutGatewayAmount
      ? "confirmed"
      : "pending";

    const appointmentData = {
      providerId,
      providerType: providerType.toLowerCase(),
      service,
      petName,
      petType,
      petId: linkedPetId,
      enquiryPetId: resolvedEnquiryPetId,
      parentPhone,
      date: primaryDate,
      selectedDates,
      time: normalizedTime,
      reason,
      healthIssues,
      userName: req.body.contactName || req.body.userName || user.name,
      userEmail: req.body.contactEmail || req.body.userEmail || user.email,
      user: req.user._id,
      petImages,
      platformFee,
      totalAmount,
      originalAmount,
      coinsUsed: coinsUsed || 0,
      coinsValue: coinsValue || 0,
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: initialPaymentStatus,
      status: initialStatus,
      paidAt: isOnlineWithoutGatewayAmount ? new Date() : undefined,
    };

    const appointment = await Appointment.create(appointmentData);

    const populated = await Appointment.findById(appointment._id)
      .populate("providerId", "name email avatar role roleData")
      .populate("user", "name email");

    const { sendNotification } = require("../../utils/pushNotification");
    const {
      sendProviderBookingNotificationEmail,
    } = require("../../utils/emailService");

    const requesterId = req.user?._id?.toString();
    const providerIdStr = providerId?.toString();
    const isSameAccount =
      requesterId && providerIdStr && requesterId === providerIdStr;

    if (coinsUsed > 0) {
      await spendCoins({
        userId: req.user._id,
        coins: coinsUsed,
        sourceType: "appointment",
        sourceId: appointment._id,
        note: `Coins used on appointment ${appointment._id}`,
      });
    }

    if (isAdoption) {
      if (providerRole === "ngo" && !isSameAccount) {
        await sendNotification(providerId, {
          title: "New Adoption Request",
          body: `${user.name} requested adoption for ${petName}.`,
          icon: "/pwa-192x192.png",
          type: "NEW_ADOPTION_REQUEST",
          data: { url: `/profile` },
        });
      }

      if (user?.role === "user") {
        await sendNotification(req.user._id, {
          title: "Adoption Request Submitted",
          body: `Your adoption request for ${petName} has been submitted.`,
          icon: "/pwa-192x192.png",
          type: "ADOPTION_REQUEST_SUBMITTED",
          data: { url: `/my-appointments` },
        });
      }
    } else {
      // Notify Provider only if it's not the same account as requester
      if (!isSameAccount) {
        const scheduleText =
          selectedDates.length > 1
            ? `${selectedDates.length} dates starting ${selectedDates[0].toLocaleDateString()}`
            : selectedDates[0].toLocaleDateString();
        const isRescueReport =
          serviceType === "others" && providerRole === "ngo";

        if (isRescueReport) {
          await sendNotification(providerId, {
            title: "New Rescue Report",
            body: `An abandoned pet (${petName || "Abandoned Pet"}) has been reported near your area.`,
            icon: "/pwa-192x192.png",
            type: "NEW_RESCUE_REPORT",
            data: { url: `/profile` },
          });
        } else {
          await sendNotification(providerId, {
            title: isCaretaker ? "New Booking Request" : "New Booking Received",
            body: `You have a new booking request for ${petName || "Pet"} on ${scheduleText}.`,
            icon: "/pwa-192x192.png",
            type: isCaretaker ? "NEW_BOOKING_REQUEST" : "NEW_BOOKING_RECEIVED",
            data: { url: `/profile` },
          });
        }

        const isVetProvider =
          providerRole === "doctor" || providerRole === "hospital";

        if (isVetProvider) {
          await sendProviderBookingNotificationEmail({
            providerEmail: provider?.email,
            providerName:
              provider?.roleData?.doctorName ||
              provider?.roleData?.hospitalName ||
              provider?.businessName ||
              provider?.name,
            customerName: user?.name,
            customerEmail: user?.email,
            customerPhone: parentPhone,
            petName,
            petType,
            service,
            appointmentDate: primaryDate,
            appointmentTime: normalizedTime,
            reason,
            appointmentId: appointment._id,
          });
        }
      }
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error("createAppointment error:", error);
    if (error?.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAppointment };
