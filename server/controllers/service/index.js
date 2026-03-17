const { getAllServices, getServiceById } = require("./get");
const { createService } = require("./post");
const { updateService } = require("./put");
const { deleteService, deleteServiceImage } = require("./delete");

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  deleteServiceImage,
};
