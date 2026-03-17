const express = require("express");
const router = express.Router();
const {
  createUserForRole,
  getUsersByRole,
  getUserById,
  updateUser,
  deleteUser,
} = require("../../controllers/role");
const {
  getProfile,
  updateProfile,
  resubmitKYC,
  acceptTerms,
} = require("../../controllers/user");
const { protect } = require("../../middleware/Auth/authMiddleware");
const { roleUpload, uploadKYC } = require("../../middleware/Multer/upload");

router.post("/", roleUpload, createUserForRole("user"));
// Profile routes (Must be before /:id)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, roleUpload, updateProfile);
router.put("/accept-terms", protect, acceptTerms);
router.put("/:id/resubmit-kyc", protect, uploadKYC, resubmitKYC);

router.get("/:id", getUserById);
router.get("/", getUsersByRole("user"));
router.put("/:id", protect, roleUpload, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;
