const Service = require("../../models/Service/service");

const createService = async (req, res) => {
  try {
    const uploadedFiles = req.files?.serviceImages || [];
    const imageNames = uploadedFiles.map((file) => file.filename);

    const { name, type, description, price, duration } = req.body;

    if (!name || !type || !description) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    if (price !== undefined && price !== "") {
      if (isNaN(price) || Number(price) < 0) {
        return res
          .status(400)
          .json({ message: "Price must be a valid non-negative number" });
      }
    }

    if (duration !== undefined && duration !== "") {
      if (isNaN(duration) || Number(duration) < 0) {
        return res
          .status(400)
          .json({ message: "Duration must be a valid non-negative number" });
      }
    }

    const validTypes = [
      "vet",
      "daycare",
      "grooming",
      "training",
      "boarding",
      "shop",
      "ngo",
    ];
    const normalizedType = String(type).trim().toLowerCase();
    if (!validTypes.includes(normalizedType)) {
      return res.status(400).json({ message: "Invalid service type" });
    }

    const duplicateType = await Service.findOne({ type: normalizedType });
    if (duplicateType) {
      return res.status(409).json({
        message: "Service type already exists. Duplicate types are not allowed.",
      });
    }

    const serviceData = {
      ...req.body,
      type: normalizedType,
      price: req.body.price ? parseFloat(req.body.price) : 0,
      duration: req.body.duration ? parseInt(req.body.duration) : 0,
      features: req.body.features
        ? req.body.features.split(",").map((f) => f.trim())
        : [],
      images: imageNames,
    };
    const service = await Service.create(serviceData);
    res.status(201).json(service);
  } catch (error) {
    console.error(
      "Error in server/controllers/service/post.js (createService):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createService,
};
