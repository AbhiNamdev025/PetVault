const Pet = require("../models/pet");

const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find({});
    res.json({ pets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPet = async (req, res) => {
  try {
    const images =
      req.files && req.files.petImages
        ? req.files.petImages.map((file) => file.filename)
        : [];

    const petData = {
      name: req.body.name,
      breed: req.body.breed,
      type: req.body.type,
      gender: req.body.gender,
      age: parseInt(req.body.age),
      ageUnit: req.body.ageUnit,
      price: parseFloat(req.body.price),
      description: req.body.description,
      vaccinated: req.body.vaccinated === "true",
      available: req.body.available === "true",
      category: req.body.category,
      images: images,
    };

    const pet = await Pet.create(petData);
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePet = async (req, res) => {
  try {
    const existingPet = await Pet.findById(req.params.id);
    if (!existingPet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    let updatedImages = existingPet.images || [];
    if (req.files && req.files.petImages) {
      const newImages = req.files.petImages.map((file) => file.filename);
      updatedImages = [...updatedImages, ...newImages];
    }

    const updateData = {
      name: req.body.name || existingPet.name,
      breed: req.body.breed || existingPet.breed,
      type: req.body.type || existingPet.type,
      gender: req.body.gender || existingPet.gender,
      age: parseInt(req.body.age) || existingPet.age,
      ageUnit: req.body.ageUnit || existingPet.ageUnit,
      price: parseFloat(req.body.price) || existingPet.price,
      description: req.body.description || existingPet.description,
      vaccinated: req.body.vaccinated === "true" || existingPet.vaccinated,
      available: req.body.available === "true" || existingPet.available,
      images: updatedImages,
    };

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json(updatedPet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: "Pet not found" });
    }
    res.json({ message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
};
