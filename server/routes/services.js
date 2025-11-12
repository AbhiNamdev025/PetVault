const express = require("express");
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  deleteServiceImage,
} = require("../controllers/serviceController");

const { protect, admin } = require("../middleware/authMiddleware");
const { uploadServiceImages } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.post("/", protect, admin, uploadServiceImages, createService);
router.put("/:id", protect, admin, uploadServiceImages, updateService);
router.delete("/:id", protect, admin, deleteService);
router.delete("/:id/image/:imageName", protect, admin, deleteServiceImage);

module.exports = router;
