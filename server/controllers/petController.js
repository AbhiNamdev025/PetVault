const fs = require("fs");
const path = require("path");
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
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPet = async (req, res) => {
  try {
    const uploadedFiles = req.files?.petImages || [];
    const imageNames = uploadedFiles.map((file) => file.filename);

    const petData = {
      ...req.body,
      age: parseInt(req.body.age),
      price: parseFloat(req.body.price),
      vaccinated: req.body.vaccinated === "true",
      available: req.body.available === "true",
      images: imageNames,
    };

    const pet = await Pet.create(petData);
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePet = async (req, res) => {
  try {
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).json({ message: "Invalid or missing pet ID" });
    }

    const { id } = req.params;
    const existingPet = await Pet.findById(id);
    if (!existingPet) return res.status(404).json({ message: "Pet not found" });

    const uploadedFiles = req.files?.petImages || [];
    const newImageNames = uploadedFiles.map((file) => file.filename);

    let updatedImages = existingPet.images;
    if (req.body.replaceImages === "true") {
      existingPet.images.forEach((img) => {
        const imgPath = path.join(__dirname, "..", "uploads", "pets", img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
      updatedImages = newImageNames;
    } else if (newImageNames.length > 0) {
      updatedImages = [...existingPet.images, ...newImageNames];
    }

    const updateData = {
      ...req.body,
      images: updatedImages,
    };

    if (req.body.age !== undefined && req.body.age !== "")
      updateData.age = parseInt(req.body.age);
    if (req.body.price !== undefined && req.body.price !== "")
      updateData.price = parseFloat(req.body.price);

    if (req.body.available !== undefined)
      updateData.available =
        req.body.available === "true" || req.body.available === true;
    if (req.body.vaccinated !== undefined)
      updateData.vaccinated =
        req.body.vaccinated === "true" || req.body.vaccinated === true;

    const updatedPet = await Pet.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updatedPet);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).json({ message: "Invalid or missing pet ID" });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    if (pet.images && pet.images.length > 0) {
      pet.images.forEach((img) => {
        const imgPath = path.join(__dirname, "..", "uploads", "pets", img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }

    await pet.deleteOne();
    res.json({ message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePetImage = async (req, res) => {
  try {
    const { id, imageName } = req.params;
    const pet = await Pet.findById(id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const imgPath = path.join(__dirname, "..", "uploads", "pets", imageName);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    pet.images = pet.images.filter((img) => img !== imageName);
    await pet.save();

    res.json({ message: "Image deleted successfully" });
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
  deletePetImage,
};
