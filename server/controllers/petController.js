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
    const updateData = { ...req.body };

    if (req.files && req.files.petImages) {
      updateData.images = req.files.petImages.map((file) => file.filename);
    }

    if (updateData.available !== undefined) {
      updateData.available =
        updateData.available === "true" || updateData.available === true;
    }
    if (updateData.vaccinated !== undefined) {
      updateData.vaccinated =
        updateData.vaccinated === "true" || updateData.vaccinated === true;
    }

    if (updateData.age !== undefined) {
      updateData.age = parseInt(updateData.age);
    }
    if (updateData.price !== undefined) {
      updateData.price = parseFloat(updateData.price);
    }

    console.log("Updating pet with data:", updateData);

    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPet) {
      return res.status(404).json({ message: "Pet not found" });
    }

    res.json(updatedPet);
  } catch (error) {
    console.error("Update error:", error);
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
