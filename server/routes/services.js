const express = require("express");
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);
router.post("/", protect, admin, createService);
router.put("/:id", protect, admin, updateService);
router.delete("/:id", protect, admin, deleteService);

module.exports = router;
