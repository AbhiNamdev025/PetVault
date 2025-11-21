const fs = require("fs");
const path = require("path");
const Pet = require("../models/pet");

const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find()
      .populate("shopId", "name email businessName")
      .populate("ngoId", "name email businessName")
      .sort({ createdAt: -1 });
    res.json({ pets });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
      .populate("shopId", "name email businessName")
      .populate("ngoId", "name email businessName");

    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const createPet = async (req, res) => {
  try {
    const imgs = (req.files?.petImages || []).map((f) => f.filename);

    const pet = await Pet.create({
      ...req.body,
      age: req.body.age ? parseInt(req.body.age) : 0,
      price: req.body.price ? parseFloat(req.body.price) : 0,
      vaccinated: req.body.vaccinated === "true",
      available: req.body.available === "true",
      featured: req.body.featured === "true",
      images: imgs,
    });

    res.status(201).json(pet);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const newImgs = (req.files?.petImages || []).map((f) => f.filename);
    let finalImgs = pet.images;

    if (req.body.replaceImages === "true") {
      pet.images.forEach((img) => {
        const file = path.join(__dirname, "..", "uploads", "pets", img);
        if (fs.existsSync(file)) fs.unlinkSync(file);
      });
      finalImgs = newImgs;
    } else if (newImgs.length > 0) {
      finalImgs = [...pet.images, ...newImgs];
    }

    const updateData = {
      ...req.body,
      age: req.body.age ? parseInt(req.body.age) : pet.age,
      price: req.body.price ? parseFloat(req.body.price) : pet.price,
      vaccinated: req.body.vaccinated === "true",
      available: req.body.available === "true",
      featured: req.body.featured === "true",
      images: finalImgs,
    };

    await Pet.findByIdAndUpdate(req.params.id, updateData);
    const refreshed = await Pet.findById(req.params.id)
      .populate("shopId", "name email businessName")
      .populate("ngoId", "name email businessName");

    res.json(refreshed);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    pet.images.forEach((img) => {
      const file = path.join(__dirname, "..", "uploads", "pets", img);
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });

    await pet.deleteOne();
    res.json({ message: "Pet deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const deletePetImage = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const file = path.join(
      __dirname,
      "..",
      "uploads",
      "pets",
      req.params.imageName
    );
    if (fs.existsSync(file)) fs.unlinkSync(file);

    pet.images = pet.images.filter((i) => i !== req.params.imageName);
    await pet.save();

    res.json({ message: "Image deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getPetsByShop = async (req, res) => {
  try {
    const pets = await Pet.find({ shopId: req.params.shopId })
      .populate("shopId", "name email businessName")
      .sort({ createdAt: -1 });

    res.json({ pets });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getPetsByNgo = async (req, res) => {
  try {
    const pets = await Pet.find({ ngoId: req.params.id })
      .populate("ngoId", "name email")
      .sort({ createdAt: -1 });

    res.json({ pets });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  getAllPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  deletePetImage,
  getPetsByShop,
  getPetsByNgo,
};
