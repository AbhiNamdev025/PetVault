const Newsletter = require("../../models/Newsletter/Newsletter");
const {
  sendWelcomeTipEmail,
  sendCustomNewsletterEmail,
} = require("../../utils/newsletterEmailService");

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    const existingSubscription = await Newsletter.findOne({ email });
    if (existingSubscription) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already subscribed" });
    }

    const newSubscription = new Newsletter({ email });
    await newSubscription.save();

    await sendWelcomeTipEmail(email);

    res.status(201).json({ success: true, message: "Subscribed successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already subscribed" });
    }
    console.error("Newsletter subscription error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    console.error("Newsletter fetch error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.sendManualEmail = async (req, res) => {
  try {
    // Expected payload { text: "admin email text" }
    const { subject, content } = req.body;

    if (!subject || !content) {
      return res
        .status(400)
        .json({ success: false, message: "Subject and content are required." });
    }

    const subscribers = await Newsletter.find(
      { isActive: { $ne: false } },
      "email",
    );
    if (!subscribers.length) {
      return res
        .status(400)
        .json({ success: false, message: "No active subscribers found." });
    }

    const emails = subscribers.map((s) => s.email);

    // Send emails (for huge db, bulk sending strategy is better, but doing map concurrently is fine here)
    const promises = emails.map((email) =>
      sendCustomNewsletterEmail(email, subject, content),
    );
    await Promise.allSettled(promises);

    res
      .status(200)
      .json({
        success: true,
        message: `Email sent to ${emails.length} subscribers!`,
      });
  } catch (error) {
    console.error("Newsletter send error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send manual emails." });
  }
};
