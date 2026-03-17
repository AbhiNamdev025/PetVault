const express = require("express");
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  deleteServiceImage,
} = require("../../controllers/service");

const { protect, admin } = require("../../middleware/Auth/authMiddleware");
const { uploadServiceImages } = require("../../middleware/Multer/upload");

const router = express.Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.post("/", protect, admin, uploadServiceImages, createService);
router.put("/:id", protect, admin, uploadServiceImages, updateService);
router.delete("/:id", protect, admin, deleteService);
router.delete("/:id/image/:imageName", protect, admin, deleteServiceImage);

module.exports = router;
