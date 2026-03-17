const express = require("express");
const router = express.Router();
const analyticsController = require("../../controllers/analytics");
const { protect } = require("../../middleware/Auth/authMiddleware");

// Get provider dashboard stats
router.get("/stats", protect, analyticsController.getProviderStats);

module.exports = router;
