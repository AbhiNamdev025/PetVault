const Pet = require("../../models/Pet/pet");
const Appointment = require("../../models/Appointment/appointment");

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildProviderServiceFilter = (role) => {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "ngo") {
    return {
      $or: [{ providerType: "ngo" }, { service: "pet_adoption" }],
    };
  }
  return {
    $or: [{ providerType: "shop" }, { service: "shop" }],
  };
};

const getOwnerFieldForRole = (role) =>
  normalizeRole(role) === "ngo" ? "ngoId" : "shopId";

const getOwnedPetForProvider = ({ petId, role, userId }) =>
  Pet.findOne({
    _id: petId,
    [getOwnerFieldForRole(role)]: userId,
    isArchived: { $ne: true },
  });

const buildBuyerList = (appointments = []) => {
  const buyerMap = new Map();

  appointments.forEach((appointment) => {
    const user = appointment?.user;
    const userId = user?._id?.toString?.();
    if (!userId) return;

    const completedAt =
      appointment?.updatedAt || appointment?.date || appointment?.createdAt;

    if (!buyerMap.has(userId)) {
      buyerMap.set(userId, {
        userId,
        name: user?.name || "Unknown User",
        email: user?.email || "",
        phone: user?.phone || "",
        avatar: user?.avatar || "",
        latestCompletedAt: completedAt,
        appointmentCount: 1,
      });
      return;
    }

    const existing = buyerMap.get(userId);
    existing.appointmentCount += 1;
    if (
      completedAt &&
      (!existing.latestCompletedAt ||
        new Date(completedAt) > new Date(existing.latestCompletedAt))
    ) {
      existing.latestCompletedAt = completedAt;
    }
  });

  return [...buyerMap.values()].sort(
    (left, right) =>
      new Date(right.latestCompletedAt || 0) -
      new Date(left.latestCompletedAt || 0),
  );
};

// GET ALL PETS (with proper shop + ngo populate)
const getAllPets = async (req, res) => {
  try {
    const { status } = req.query;
    const query =
      status === "archived"
        ? { isArchived: true }
        : { isArchived: { $ne: true } };

    const pets = await Pet.find(query)
      .populate({
        path: "shopId",
        match: { isVerified: true, isArchived: false },
        select: "name email roleData",
      })
      .populate({
        path: "ngoId",
        match: { isVerified: true, isArchived: false },
        select: "name email roleData",
      })
      .populate("soldToUserId", "name email phone avatar")
      .sort({ available: -1, createdAt: -1 });

    // Filter pets to ensure they belong to an active, verified provider
    const filteredPets = pets.filter((pet) => pet.shopId || pet.ngoId);

    res.json({ pets: filteredPets });
  } catch (e) {
    console.error("Error in server/controllers/pet/get.js (getAllPets):", e);
    res.status(500).json({ message: e.message });
  }
};

// GET SINGLE PET
const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      isArchived: { $ne: true },
    })
      .populate({
        path: "shopId",
        match: { isVerified: true, isArchived: false },
        select: "name email phone role roleData avatar",
      })
      .populate({
        path: "ngoId",
        match: { isVerified: true, isArchived: false },
        select: "name email phone role roleData avatar",
      })
      .populate("soldToUserId", "name email phone avatar");

    if (!pet || (!pet.shopId && !pet.ngoId)) {
      return res.status(404).json({ message: "Pet not found or unavailable" });
    }

    res.json(pet);
  } catch (e) {
    console.error("Error in server/controllers/pet/get.js (getPetById):", e);
    res.status(500).json({ message: e.message });
  }
};

// PETS BY SHOP
const getPetsByShop = async (req, res) => {
  try {
    const pets = await Pet.find({
      shopId: req.params.shopId,
      isArchived: { $ne: true },
    })
      .populate({
        path: "shopId",
        match: { isVerified: true, isArchived: false },
        select: "name email roleData",
      })
      .populate("soldToUserId", "name email phone avatar")
      .sort({ available: -1, createdAt: -1 });

    // Ensure results only contain pets from active, verified provider
    const filteredPets = pets.filter((pet) => pet.shopId);

    res.json({ pets: filteredPets });
  } catch (e) {
    console.error("Error in server/controllers/pet/get.js (getPetsByShop):", e);
    res.status(500).json({ message: e.message });
  }
};

// PETS BY NGO
const getPetsByNgo = async (req, res) => {
  try {
    const pets = await Pet.find({
      ngoId: req.params.ngoId,
      available: true,
      isArchived: { $ne: true },
    })
      .populate({
        path: "ngoId",
        match: { isVerified: true, isArchived: false },
        select: "name email roleData",
      })
      .populate("soldToUserId", "name email phone avatar")
      .sort({ createdAt: -1 });

    const filteredPets = pets.filter((pet) => pet.ngoId);

    res.json({ pets: filteredPets });
  } catch (e) {
    console.error("Error in server/controllers/pet/get.js (getPetsByNgo):", e);
    res.status(500).json({ message: e.message });
  }
};

const getMyProviderPets = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);
    if (!["shop", "ngo"].includes(role)) {
      return res.status(403).json({
        message: "Only shop and NGO accounts can access this resource",
      });
    }

    const ownerField = getOwnerFieldForRole(role);
    const populateOwnerPath = role === "ngo" ? "ngoId" : "shopId";

    const pets = await Pet.find({
      [ownerField]: req.user._id,
      isArchived: { $ne: true },
    })
      .populate(populateOwnerPath, "name email roleData avatar")
      .populate("soldToUserId", "name email phone avatar")
      .sort({ available: -1, createdAt: -1 });

    res.json({ pets });
  } catch (e) {
    console.error(
      "Error in server/controllers/pet/get.js (getMyProviderPets):",
      e,
    );
    res.status(500).json({ message: e.message });
  }
};

const getEligibleBuyersForPet = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid pet ID" });
    }

    const role = normalizeRole(req.user?.role);
    if (!["shop", "ngo"].includes(role)) {
      return res.status(403).json({
        message: "Only shop and NGO accounts can access this resource",
      });
    }

    const pet = await getOwnedPetForProvider({
      petId: req.params.id,
      role,
      userId: req.user._id,
    });
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    const providerServiceFilter = buildProviderServiceFilter(role);
    const baseFilter = {
      providerId: req.user._id,
      status: "completed",
      user: { $exists: true, $ne: null },
      ...providerServiceFilter,
    };

    let appointments = await Appointment.find({
      ...baseFilter,
      enquiryPetId: pet._id,
    })
      .populate("user", "name email phone avatar")
      .select("user createdAt updatedAt date")
      .sort({ updatedAt: -1, createdAt: -1 });

    if (!appointments.length) {
      appointments = await Appointment.find({
        ...baseFilter,
        enquiryPetId: { $exists: false },
        petName: {
          $regex: `^${escapeRegex(pet.name)}$`,
          $options: "i",
        },
        petType: {
          $regex: `^${escapeRegex(pet.type)}$`,
          $options: "i",
        },
      })
        .populate("user", "name email phone avatar")
        .select("user createdAt updatedAt date")
        .sort({ updatedAt: -1, createdAt: -1 });
    }

    const buyers = buildBuyerList(appointments);

    res.json({
      petId: pet._id,
      buyers,
    });
  } catch (e) {
    console.error(
      "Error in server/controllers/pet/get.js (getEligibleBuyersForPet):",
      e,
    );
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  getAllPets,
  getPetById,
  getPetsByShop,
  getPetsByNgo,
  getMyProviderPets,
  getEligibleBuyersForPet,
};
