const fs = require("fs");
const path = require("path");
const Service = require("../models/service");

const getAllServices = async (req, res) => {
  try {
    const { type } = req.query;
    let query = { available: true };
    if (type) query.type = type;
    const services = await Service.find(query).sort({ price: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const uploadedFiles = req.files?.serviceImages || [];
    const imageNames = uploadedFiles.map((file) => file.filename);
    const serviceData = {
      ...req.body,
      price: parseFloat(req.body.price),
      duration: parseInt(req.body.duration),
      features: req.body.features
        ? req.body.features.split(",").map((f) => f.trim())
        : [],
      images: imageNames,
    };
    const service = await Service.create(serviceData);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).json({ message: "Invalid or missing service ID" });
    }
    const { id } = req.params;
    const uploadedFiles = req.files?.serviceImages || [];
    const imageNames = uploadedFiles.map((file) => file.filename);
    const existing = await Service.findById(id);
    if (!existing)
      return res.status(404).json({ message: "Service not found" });

    let updatedImages = existing.images;
    if (req.body.replaceImages === "true") {
      existing.images.forEach((img) => {
        const imgPath = path.join(__dirname, "..", "uploads", "services", img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
      updatedImages = imageNames;
    } else if (imageNames.length > 0) {
      updatedImages = [...existing.images, ...imageNames];
    }

    const updateData = {
      ...req.body,
      price: parseFloat(req.body.price),
      duration: parseInt(req.body.duration),
      features: req.body.features
        ? req.body.features.split(",").map((f) => f.trim())
        : existing.features,
      images: updatedImages,
    };

    const updated = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    if (service.images && service.images.length > 0) {
      service.images.forEach((img) => {
        const imgPath = path.join(__dirname, "..", "uploads", "services", img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }
    await service.deleteOne();
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const deleteServiceImage = async (req, res) => {
  try {
    const { id, imageName } = req.params;
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const imgPath = path.join(
      __dirname,
      "..",
      "uploads",
      "services",
      imageName
    );
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    service.images = service.images.filter((img) => img !== imageName);
    await service.save();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  deleteServiceImage,
};
