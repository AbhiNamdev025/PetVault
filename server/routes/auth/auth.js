const express = require("express");
const router = express.Router();
const { uploadKYC } = require("../../middleware/Multer/upload");
const { signup, login, sendOTP } = require("../../controllers/auth");

router.post("/send-otp", sendOTP);
router.post("/register", uploadKYC, signup);
router.post("/login", login);

module.exports = router;
