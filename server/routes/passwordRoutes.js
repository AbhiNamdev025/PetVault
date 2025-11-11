const express = require("express");
const router = express.Router();
const {
  sendVerificationCode,
  verifyCode,
  resetPassword,
} = require("../controllers/passwordController");

// Send OTP
router.post("/send-code", sendVerificationCode);

// Verify OTP
router.post("/verify-code", verifyCode);

// Reset Password
router.post("/reset-password", resetPassword);

module.exports = router;
