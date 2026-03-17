const User = require("../../models/User/user");
const Notification = require("../../models/Notification/notification");
const { sendNotification } = require("../../utils/pushNotification");

// Subscribe to push notifications
exports.subscribe = async (req, res) => {
  const { subscription } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ message: "Subscription object is required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure the same browser endpoint is linked to only one account.
    await User.updateMany(
      {
        _id: { $ne: user._id },
        "pushSubscriptions.endpoint": subscription.endpoint,
      },
      {
        $pull: {
          pushSubscriptions: { endpoint: subscription.endpoint },
        },
      },
    );

    // Check if subscription already exists for current user
    const exists = user.pushSubscriptions.some(
      (sub) => sub.endpoint === subscription.endpoint,
    );

    if (!exists) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    res.status(201).json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Error subscribing:", error);
    res.status(500).json({ message: "Failed to subscribe" });
  }
};

// Unsubscribe
exports.unsubscribe = async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ message: "Endpoint is required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.pushSubscriptions = user.pushSubscriptions.filter(
      (sub) => sub.endpoint !== endpoint,
    );
    await user.save();

    res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit)
      ? Math.max(1, Math.min(rawLimit, 100))
      : 20;

    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true },
      { new: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Notification not found for this user" });
    }

    res.status(200).json({ message: "Marked as read", notification: updated });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true },
    );

    res.status(200).json({
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

// Get VAPID Public Key
exports.getPublicKey = (req, res) => {
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

// Test notification (for dev)
// Test notification (for dev)
exports.testNotification = async (req, res) => {
  try {
    const success = await sendNotification(req.user.id, {
      title: "Test Notification",
      body: "This is a test notification from PetVault!",
      icon: "/pwa-192x192.png",
      data: { url: "/" },
    });

    if (success) {
      res.status(200).json({ message: "Test notification sent successfully" });
    } else {
      res
        .status(500)
        .json({
          message:
            "Failed to send notification (Check server logs for VAPID/Sub issues)",
        });
    }
  } catch (error) {
    console.error("Test notification error:", error);
    res
      .status(500)
      .json({ message: "Failed to send test notification: " + error.message });
  }
};
