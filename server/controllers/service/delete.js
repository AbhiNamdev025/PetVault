const fs = require("fs");
const path = require("path");
const Service = require("../../models/Service/service");

const deleteService = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    if (service.images && service.images.length > 0) {
      service.images.forEach((img) => {
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
    }
    await service.deleteOne();
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error(
      "Error in server/controllers/service/delete.js (deleteService):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const deleteServiceImage = async (req, res) => {
  try {
    const { id, imageName } = req.params;
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid service ID" });
    }

    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    const imgPath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "services",
      imageName,
    );
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    service.images = service.images.filter((img) => img !== imageName);
    await service.save();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error(
      "Error in server/controllers/service/delete.js (deleteServiceImage):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  deleteService,
  deleteServiceImage,
};
