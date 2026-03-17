const express = require("express");
const router = express.Router();
const notificationController = require("../../controllers/notification/notificationController");
const { protect } = require("../../middleware/Auth/authMiddleware");

// Subscribe to push notifications
router.post("/subscribe", protect, notificationController.subscribe);

// Unsubscribe
router.post("/unsubscribe", protect, notificationController.unsubscribe);

// Get user notifications
router.get("/", protect, notificationController.getUserNotifications);

// Mark as read
router.put("/:id/read", protect, notificationController.markAsRead);
router.put("/read-all", protect, notificationController.markAllAsRead);

// Get VAPID Public Key
router.get("/vapid-public-key", notificationController.getPublicKey);

// Test notification
router.post("/test", protect, notificationController.testNotification);

module.exports = router;
