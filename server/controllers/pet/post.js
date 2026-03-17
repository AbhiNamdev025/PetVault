const Pet = require("../../models/Pet/pet");

// CREATE PET
const createPet = async (req, res) => {
  try {
    const {
      name,
      type,
      breed,
      age,
      gender,
      description,
      color,
      category,
      price,
    } = req.body;

    if (
      !name ||
      !type ||
      !breed ||
      !gender ||
      !description ||
      !color ||
      !category
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    if (!age && !req.body.dob) {
      return res
        .status(400)
        .json({ message: "Age or Date of Birth is required" });
    }

    if (price && Number(price) < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    const imgs = (req.files?.petImages || []).map((f) => f.filename);

    const pet = await Pet.create({
      ...req.body,
      age: req.body.age ? Number(req.body.age) : undefined,
      price: req.body.price ? Number(req.body.price) : 0,
      weight: req.body.weight ? Number(req.body.weight) : undefined,
      medicalConditions: Array.isArray(req.body.medicalConditions)
        ? req.body.medicalConditions
        : req.body.medicalConditions
          ? [req.body.medicalConditions]
          : [],
      allergies: Array.isArray(req.body.allergies)
        ? req.body.allergies
        : req.body.allergies
          ? [req.body.allergies]
          : [],
      vaccinated: req.body.vaccinated === "true",
      available: req.body.available === "true",
      featured: req.body.featured === "true",
      dewormed: req.body.dewormed === "true",
      images: imgs,
    });

    res.status(201).json(pet);
  } catch (e) {
    console.error("Error in server/controllers/pet/post.js (createPet):", e);
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  createPet,
};
