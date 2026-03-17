const express = require("express");
const router = express.Router();

const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../../controllers/role");

const { rateDoctor } = require("../../controllers/rating");
const { roleUpload } = require("../../middleware/Multer/upload");
const { protect } = require("../../middleware/Auth/authMiddleware");

const allowDoctorCreation = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "hospital") {
    return next();
  }
  return res.status(403).json({ message: "Only hospital/admin allowed" });
};

router.post(
  "/",
  protect,
  allowDoctorCreation,
  roleUpload,
  createUserForRole("doctor"),
);

router.get("/", getUsersByRole("doctor"));
router.get("/:id", getUserById);

router.post("/:id/rate", protect, rateDoctor);

router.put("/:id", protect, roleUpload, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;
