const webpush = require("web-push");
const User = require("../models/User/user");
const Notification = require("../models/Notification/notification");

webpush.setVapidDetails(
  "mailto:nmdvabhi786@gmail.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

/**
 * Send a notification to a specific user
 * @param {string} userId - The ID of the recipient user
 * @param {object} payload - The notification payload { title, body, icon, url, type }
 */
const sendNotification = async (userId, payload) => {
  try {
    if (!userId) {
      return false;
    }

    const user = await User.findById(userId);
    if (!user) {
      return false;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/pwa-192x192.png",
      data: {
        url: payload.url || "/",
        ...payload.data,
      },
    });

    let attemptedPush = false;
    let pushDelivered = false;

    if (Array.isArray(user.pushSubscriptions) && user.pushSubscriptions.length > 0) {
      attemptedPush = true;
      const results = await Promise.all(
        user.pushSubscriptions.map(async (subscription) => {
          try {
            await webpush.sendNotification(subscription, notificationPayload);
            return { success: true };
          } catch (err) {
            console.error(`Push error for user ${userId}:`, err.message);
            if (err.statusCode === 410 || err.statusCode === 404) {
              // Subscription expired or gone
              await User.findByIdAndUpdate(userId, {
                $pull: { pushSubscriptions: { endpoint: subscription.endpoint } },
              });
            }
            return { success: false, error: err };
          }
        }),
      );

      pushDelivered = results.some((item) => item.success);
    } else {
      console.log(`No push subscriptions found for user: ${userId}`);
    }

    // Save history for in-app alerts even when push subscription is unavailable.
    await Notification.create({
      recipient: userId,
      type: payload.type || "GENERAL",
      title: payload.title,
      message: payload.body,
      payload: {
        url: payload.url || payload.data?.url || "/",
        ...(payload.data || {}),
      },
      isRead: false,
    });

    if (attemptedPush) {
      return pushDelivered;
    }
    return true;
  } catch (error) {
    console.error("Error in sendNotification:", error);
    return false;
  }
};

/**
 * Send a notification to all admins
 * @param {object} payload - The notification payload
 */
const sendAdminNotification = async (payload) => {
  try {
    const admins = await User.find({ role: "admin" });
    const promises = admins.map((admin) =>
      sendNotification(admin._id, payload),
    );
    await Promise.all(promises);
  } catch (error) {
    console.error("Error sending admin notification:", error);
  }
};

module.exports = { sendNotification, sendAdminNotification };
