const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
  getDoctorsByHospital,
} = require("../../controllers/role");
const { rateHospital } = require("../../controllers/rating");
const { roleUpload } = require("../../middleware/Multer/upload");
const { protect } = require("../../middleware/Auth/authMiddleware");

router.get("/doctors/:hospitalId", getDoctorsByHospital);

router.get("/", getUsersByRole("hospital"));

router.get("/:id", getUserById);

router.put("/:id", protect, roleUpload, updateUser);

router.delete("/:id", protect, deleteUser);
router.post("/:id/rate", protect, rateHospital);

module.exports = router;
