const Service = require("../../models/Service/service");

const getAllServices = async (req, res) => {
  try {
    const { type } = req.query;
    let query = { available: true };
    if (type) query.type = type;
    const services = await Service.find(query).sort({ price: 1 });
    res.json(services);
  } catch (error) {
    console.error(
      "Error in server/controllers/service/get.js (getAllServices):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (error) {
    console.error(
      "Error in server/controllers/service/get.js (getServiceById):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
};
