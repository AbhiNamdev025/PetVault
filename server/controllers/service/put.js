const fs = require("fs");
const path = require("path");
const Service = require("../../models/Service/service");

const updateService = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!req.params.id || !isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }
    const { id } = req.params;

    if (
      req.body.price &&
      (isNaN(req.body.price) || Number(req.body.price) <= 0)
    ) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }
    if (
      req.body.duration &&
      (isNaN(req.body.duration) || Number(req.body.duration) <= 0)
    ) {
      return res
        .status(400)
        .json({ message: "Duration must be a positive number" });
    }
    let normalizedType = null;
    if (req.body.type) {
      const validTypes = [
        "vet",
        "daycare",
        "grooming",
        "training",
        "boarding",
        "shop",
        "ngo",
      ];
      normalizedType = String(req.body.type).trim().toLowerCase();
      if (!validTypes.includes(normalizedType)) {
        return res.status(400).json({ message: "Invalid service type" });
      }

      const duplicateType = await Service.findOne({
        type: normalizedType,
        _id: { $ne: id },
      });
      if (duplicateType) {
        return res.status(409).json({
          message: "Service type already exists. Duplicate types are not allowed.",
        });
      }
    }
    const uploadedFiles = req.files?.serviceImages || [];
    const imageNames = uploadedFiles.map((file) => file.filename);
    const existing = await Service.findById(id);
    if (!existing)
      return res.status(404).json({ message: "Service not found" });

    let updatedImages = existing.images;
    if (req.body.replaceImages === "true") {
      existing.images.forEach((img) => {
        const imgPath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "services",
          img,
        );
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
      updatedImages = imageNames;
    } else if (imageNames.length > 0) {
      updatedImages = [...existing.images, ...imageNames];
    }

    const updateData = {
      ...req.body,
      type: normalizedType || existing.type,
      price: req.body.price ? parseFloat(req.body.price) : existing.price || 0,
      duration: req.body.duration
        ? parseInt(req.body.duration)
        : existing.duration || 0,
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
    console.error(
      "Error in server/controllers/service/put.js (updateService):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateService,
};
