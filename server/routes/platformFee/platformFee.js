const express = require("express");
const router = express.Router();
const {
  getPlatformFeeConfig,
  updatePlatformFeeConfig,
} = require("../../controllers/platformFee");
const { protect, admin } = require("../../middleware/Auth/authMiddleware");

// Public read access (frontend can display correct fee)
router.get("/", getPlatformFeeConfig);

// Admin update
router.put("/", protect, admin, updatePlatformFeeConfig);

module.exports = router;
