const fs = require("fs");
const path = require("path");
const Pet = require("../../models/Pet/pet");
const Appointment = require("../../models/Appointment/appointment");
const User = require("../../models/User/user");
const UserPet = require("../../models/UserPet/userPet");

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const toTitleCase = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getOwnerFieldForRole = (role) =>
  normalizeRole(role) === "ngo" ? "ngoId" : "shopId";

const buildProviderServiceFilter = (role) => {
  if (normalizeRole(role) === "ngo") {
    return {
      $or: [{ providerType: "ngo" }, { service: "pet_adoption" }],
    };
  }
  return {
    $or: [{ providerType: "shop" }, { service: "shop" }],
  };
};

const normalizeUserPetGender = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "male") return "Male";
  if (normalized === "female") return "Female";
  return "Unknown";
};

const findCompletedSaleAppointmentForPet = async ({
  pet,
  providerId,
  buyerUserId,
  role,
}) => {
  const baseFilter = {
    providerId,
    user: buyerUserId,
    status: "completed",
    ...buildProviderServiceFilter(role),
  };

  const byListing = await Appointment.findOne({
    ...baseFilter,
    enquiryPetId: pet._id,
  }).sort({ updatedAt: -1, createdAt: -1 });

  if (byListing) {
    return byListing;
  }

  return Appointment.findOne({
    ...baseFilter,
    enquiryPetId: { $exists: false },
    petName: { $regex: `^${escapeRegex(pet.name)}$`, $options: "i" },
    petType: { $regex: `^${escapeRegex(pet.type)}$`, $options: "i" },
  }).sort({ updatedAt: -1, createdAt: -1 });
};

// UPDATE PET
const updatePet = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Pet ID format" });
    }

    if (req.body.price && Number(req.body.price) < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    if (pet.soldToUserId || !pet.available) {
      return res.status(403).json({
        message: "This pet has been sold and can no longer be edited.",
      });
    }

    const newImgs = (req.files?.petImages || []).map((f) => f.filename);
    let finalImgs = pet.images;

    if (req.body.replaceImages === "true") {
      pet.images.forEach((img) => {
        const file = path.join(__dirname, "..", "..", "uploads", "pets", img);
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });
      finalImgs = newImgs;
    } else if (newImgs.length > 0) {
      finalImgs = [...finalImgs, ...newImgs];
    }

    const updateData = {
      ...req.body,
      age: req.body.age ? Number(req.body.age) : pet.age,
      price: req.body.price ? Number(req.body.price) : pet.price,
      weight: req.body.weight ? Number(req.body.weight) : pet.weight,
      medicalConditions: Array.isArray(req.body.medicalConditions)
        ? req.body.medicalConditions
        : req.body.medicalConditions
          ? [req.body.medicalConditions]
          : pet.medicalConditions,
      allergies: Array.isArray(req.body.allergies)
        ? req.body.allergies
        : req.body.allergies
          ? [req.body.allergies]
          : pet.allergies,
      vaccinated: req.body.vaccinated === "true",
      available: req.body.available === "true",
      featured: req.body.featured === "true",
      dewormed: req.body.dewormed === "true",
      images: finalImgs,
    };
    const updatePayload = { $set: updateData };
    if (updateData.available) {
      updatePayload.$unset = {
        soldToUserId: 1,
        soldAt: 1,
        soldAppointmentId: 1,
        soldUserPetId: 1,
      };
    }

    await Pet.findByIdAndUpdate(req.params.id, updatePayload);
    const updated = await Pet.findById(req.params.id)
      .populate("shopId", "name email roleData")
      .populate("ngoId", "name email roleData")
      .populate("soldToUserId", "name email phone avatar");

    res.json(updated);
  } catch (e) {
    console.error("Error in server/controllers/pet/put.js (updatePet):", e);
    res.status(500).json({ message: e.message });
  }
};

const markPetAsSoldToUser = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid pet ID" });
    }

    const sellerRole = normalizeRole(req.user?.role);
    if (!["shop", "ngo"].includes(sellerRole)) {
      return res.status(403).json({
        message: "Only shop and NGO accounts can complete this action",
      });
    }

    const { userId } = req.body || {};
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid buyer user ID" });
    }

    const ownerField = getOwnerFieldForRole(sellerRole);
    const pet = await Pet.findOne({
      _id: req.params.id,
      [ownerField]: req.user._id,
      isArchived: { $ne: true },
    }).populate("soldToUserId", "name email");

    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const alreadySoldTo = pet.soldToUserId?._id?.toString?.();
    if (alreadySoldTo && alreadySoldTo !== String(userId)) {
      return res.status(409).json({
        message: `This pet is already sold to ${pet.soldToUserId.name || "another user"}.`,
      });
    }

    const buyer = await User.findById(userId).select(
      "_id name email phone role isArchived",
    );
    if (!buyer || buyer.isArchived) {
      return res.status(404).json({ message: "Buyer user not found" });
    }
    if (normalizeRole(buyer.role) !== "user") {
      return res.status(400).json({
        message: "Pet can be sold only to a customer account",
      });
    }

    const completedAppointment = await findCompletedSaleAppointmentForPet({
      pet,
      providerId: req.user._id,
      buyerUserId: buyer._id,
      role: sellerRole,
    });

    if (!completedAppointment) {
      return res.status(400).json({
        message:
          "Selected user has no completed booking for this pet. Choose a completed booking user.",
      });
    }

    const resolvedSpecies = toTitleCase(pet.type) || "Other";
    const sourceMetadata = {
      acquisitionType: sellerRole === "ngo" ? "adopted" : "bought",
      originShopId: sellerRole === "shop" ? pet.shopId : undefined,
      originNgoId: sellerRole === "ngo" ? pet.ngoId : undefined,
    };

    let userPet = await UserPet.findOne({
      owner: buyer._id,
      status: { $ne: "archived" },
      name: { $regex: `^${escapeRegex(pet.name)}$`, $options: "i" },
      species: { $regex: `^${escapeRegex(resolvedSpecies)}$`, $options: "i" },
    }).sort({ updatedAt: -1, createdAt: -1 });

    if (!userPet) {
      userPet = await UserPet.create({
        owner: buyer._id,
        name: pet.name,
        species: resolvedSpecies,
        breed: pet.breed || "Not specified",
        gender: normalizeUserPetGender(pet.gender),
        colorMarks: pet.color || "",
        identifiableMarks: pet.identifiableMarks || "",
        weight: pet.weight,
        dob: pet.dob,
        age: pet.age,
        ageUnit: pet.ageUnit,
        medicalConditions: pet.medicalConditions || [],
        allergies: pet.allergies || [],
        profileImage: pet.images?.[0] || "",
        ...sourceMetadata,
      });
    } else {
      const sourceChanged =
        String(userPet.originShopId || "") !==
          String(sourceMetadata.originShopId || "") ||
        String(userPet.originNgoId || "") !==
          String(sourceMetadata.originNgoId || "") ||
        userPet.acquisitionType !== sourceMetadata.acquisitionType;

      if (sourceChanged) {
        userPet.originShopId = sourceMetadata.originShopId;
        userPet.originNgoId = sourceMetadata.originNgoId;
        userPet.acquisitionType = sourceMetadata.acquisitionType;
        await userPet.save();
      }
    }

    pet.available = false;
    pet.soldToUserId = buyer._id;
    pet.soldAt = new Date();
    pet.soldAppointmentId = completedAppointment._id;
    pet.soldUserPetId = userPet._id;
    await pet.save();

    if (
      !completedAppointment.petId ||
      String(completedAppointment.petId) !== String(userPet._id)
    ) {
      completedAppointment.petId = userPet._id;
      await completedAppointment.save();
    }

    const {
      sendPetSaleConfirmationEmail,
    } = require("../../utils/emailService");
    const { sendNotification } = require("../../utils/pushNotification");

    await sendPetSaleConfirmationEmail(
      buyer.email,
      buyer.name,
      pet.name,
      pet.images?.[0],
    );

    await sendNotification(buyer._id, {
      title: "Pet Added To My Pets",
      body: `${pet.name} has been marked as sold to you and added to your pet profiles.`,
      icon: "/pwa-192x192.png",
      type: "PET_ADDED_TO_MY_PETS",
      data: { url: "/profile?tab=mypets" },
    });

    const updatedPet = await Pet.findById(pet._id)
      .populate("shopId", "name email roleData")
      .populate("ngoId", "name email roleData")
      .populate("soldToUserId", "name email phone avatar");

    return res.json({
      message: `Pet marked as sold to ${buyer.name}.`,
      pet: updatedPet,
      userPet,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/pet/put.js (markPetAsSoldToUser):",
      error,
    );
    return res.status(500).json({ message: error.message });
  }
};

const restorePet = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid pet ID" });
    }

    const pet = await Pet.findById(req.params.id)
      .populate({ path: "shopId", select: "name email" })
      .populate({ path: "ngoId", select: "name email" });

    if (!pet) return res.status(404).json({ message: "Pet not found" });

    pet.isArchived = false;
    await pet.save();

    const owner = pet.shopId || pet.ngoId;
    if (owner && owner.email) {
      const {
        sendRestoreNotificationEmail,
      } = require("../../utils/emailService");
      await sendRestoreNotificationEmail(
        owner.email,
        owner.name,
        "pet",
        pet.name,
        pet.images?.[0],
      );
    }

    res.json({ message: "Pet restored successfully", pet });
  } catch (error) {
    console.error(
      "Error in server/controllers/pet/put.js (restorePet):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updatePet,
  restorePet,
  markPetAsSoldToUser,
};
