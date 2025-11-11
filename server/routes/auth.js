const express = require("express");
const {
  register,
  login,
  getProfile,
  updateProfile,
  checkEmail,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const { uploadAvatar } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/check-email", checkEmail);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, uploadAvatar, updateProfile);

module.exports = router;
