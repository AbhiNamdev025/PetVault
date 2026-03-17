const UserPet = require("../../models/UserPet/userPet");

// Update a pet
const updateUserPet = async (req, res) => {
  try {
    const { id } = req.params;
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Pet ID" });
    }

    const updates = { ...req.body };

    const hasDob =
      updates.dob !== undefined && updates.dob !== null && updates.dob !== "";
    const hasAge =
      updates.age !== undefined &&
      updates.age !== null &&
      String(updates.age).trim() !== "";

    if (hasDob && hasAge) {
      return res.status(400).json({
        message: "Provide either date of birth or age (not both).",
      });
    }

    if (hasAge && (isNaN(updates.age) || Number(updates.age) < 0)) {
      return res.status(400).json({ message: "Age must be a positive number" });
    }
    if (
      updates.weight &&
      (isNaN(updates.weight) || Number(updates.weight) < 0)
    ) {
      return res
        .status(400)
        .json({ message: "Weight must be a positive number" });
    }
    if (updates.gender) {
      const validGenders = ["Male", "Female", "Unknown"];
      if (!validGenders.includes(updates.gender)) {
        return res.status(400).json({ message: "Invalid gender" });
      }
    }

    if (updates.microchipId) {
      const existingChip = await UserPet.findOne({
        microchipId: updates.microchipId,
        _id: { $ne: id },
      });
      if (existingChip) {
        return res.status(400).json({ message: "Microchip ID already exists" });
      }
    }

    if (req.file) {
      updates.profileImage = req.file.filename;
    }

    // Normalize date of birth if provided
    if (hasDob) {
      updates.dob = new Date(updates.dob);
    }
    if (hasAge) {
      updates.age = Number(updates.age);
    }

    // Parse arrays if they come as strings (multipart/form-data)
    if (typeof updates.medicalConditions === "string") {
      updates.medicalConditions = JSON.parse(updates.medicalConditions);
    }
    if (typeof updates.allergies === "string") {
      updates.allergies = JSON.parse(updates.allergies);
    }

    const unset = {};
    if (hasDob) unset.age = 1;
    if (hasAge) unset.dob = 1;

    const updatedPet = await UserPet.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      {
        $set: updates,
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
      },
      { new: true },
    );

    if (!updatedPet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json(updatedPet);
  } catch (error) {
    console.error(
      "Error in server/controllers/userPet/put.js (updateUserPet):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const restoreUserPet = async (req, res) => {
  try {
    const { id } = req.params;
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid Pet ID" });
    }

    const restoredPet = await UserPet.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { $set: { status: "active" }, $unset: { deletedAt: 1 } },
      { new: true },
    );

    if (!restoredPet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json({ message: "Pet restored successfully", pet: restoredPet });
  } catch (error) {
    console.error(
      "Error in server/controllers/userPet/put.js (restoreUserPet):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateUserPet,
  restoreUserPet,
};
