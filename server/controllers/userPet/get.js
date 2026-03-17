const UserPet = require("../../models/UserPet/userPet");

// Get all pets for a user
const getUserPets = async (req, res) => {
  try {
    const includeArchived = req.query.includeArchived === "true";
    const query = { owner: req.user._id };
    if (!includeArchived) {
      query.status = { $ne: "archived" };
    }
    const pets = await UserPet.find(query)
      .populate("originShopId", "name email phone role roleData")
      .populate("originNgoId", "name email phone role roleData")
      .sort({ createdAt: -1 });
    res.json(pets);
  } catch (error) {
    console.error(
      "Error in server/controllers/userPet/get.js (getUserPets):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getUserPetById = async (req, res) => {
  try {
    const pet = await UserPet.findById(req.params.id)
      .populate("owner", "name email phone avatar")
      .populate("originShopId", "name email phone role roleData")
      .populate("originNgoId", "name email phone role roleData");
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
  } catch (error) {
    console.error(
      "Error in server/controllers/userPet/get.js (getUserPetById):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserPets,
  getUserPetById,
};
