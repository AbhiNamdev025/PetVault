const UserPet = require("../../models/UserPet/userPet");

// Add a new pet
const addUserPet = async (req, res) => {
  try {
    const {
      name,
      species,
      breed,
      age,
      dob,
      gender,
      weight,
      colorMarks,
      microchipId,
      adoptionSource,
      medicalConditions,
      allergies,
    } = req.body;
    let profileImage = "";
    if (req.file) {
      profileImage = req.file.filename;
    }

    if (!name || !species || !breed || !gender || !weight || !colorMarks) {
      return res.status(400).json({
        message:
          "Name, species, breed, gender, weight, and color/marks are required",
      });
    }

    const hasDob = Boolean(dob);
    const hasAge = age !== undefined && age !== null && String(age).trim() !== "";
    if ((hasDob && hasAge) || (!hasDob && !hasAge)) {
      return res.status(400).json({
        message: "Provide either date of birth or age (not both).",
      });
    }

    if (hasAge && (isNaN(age) || Number(age) < 0)) {
      return res.status(400).json({ message: "Age must be a positive number" });
    }

    if (weight && (isNaN(weight) || Number(weight) < 0)) {
      return res
        .status(400)
        .json({ message: "Weight must be a positive number" });
    }

    const validGenders = ["Male", "Female", "Unknown"];
    if (gender && !validGenders.includes(gender)) {
      return res.status(400).json({ message: "Invalid gender" });
    }

    if (microchipId) {
      const existingChip = await UserPet.findOne({ microchipId });
      if (existingChip) {
        return res
          .status(400)
          .json({ message: "Microchip ID already exists" });
      }
    }

    const duplicateQuery = {
      owner: req.user._id,
      name,
      species,
      status: { $ne: "archived" },
    };
    if (hasDob) {
      duplicateQuery.dob = new Date(dob);
    } else if (hasAge) {
      duplicateQuery.age = Number(age);
    }
    const existingPet = await UserPet.findOne(duplicateQuery);
    if (existingPet) {
      return res
        .status(400)
        .json({ message: "A similar pet profile already exists" });
    }

    const newPet = await UserPet.create({
      owner: req.user._id,
      name,
      species,
      breed,
      age: hasAge ? Number(age) : undefined,
      dob: hasDob ? new Date(dob) : undefined,
      gender,
      weight,
      colorMarks,
      profileImage,
      microchipId,
      adoptionSource,
      medicalConditions: medicalConditions ? JSON.parse(medicalConditions) : [],
      allergies: allergies ? JSON.parse(allergies) : [],
    });

    res.status(201).json(newPet);
  } catch (error) {
    console.error(
      "Error in server/controllers/userPet/post.js (addUserPet):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addUserPet,
};
