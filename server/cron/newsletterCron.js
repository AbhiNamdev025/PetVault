const cron = require("node-cron");
const Newsletter = require("../models/Newsletter/Newsletter");
const { sendMonthlyTipEmail } = require("../utils/newsletterEmailService");

// This cron job will run on the 1st day of every month at 9:00 AM
// "0 9 1 * *" translates to: Minute 0, Hour 9, 1st Day of Month, Every Month, Every Day of Week
const initNewsletterCron = () => {
  cron.schedule("0 9 1 * *", async () => {
    console.log("Running monthly newsletter cron job...");

    try {
      // Find all active subscribers
      const subscribers = await Newsletter.find(
        { isActive: { $ne: false } },
        "email",
      );

      if (!subscribers || subscribers.length === 0) {
        console.log(
          "No active newsletter subscribers found. Skipping broadcast.",
        );
        return;
      }

      console.log(
        `Preparing to send monthly tip to ${subscribers.length} subscribers...`,
      );

      // Send emails
      const emails = subscribers.map((sub) => sub.email);
      const promises = emails.map((email) => sendMonthlyTipEmail(email));

      // We use Promise.allSettled so that if one email fails, others still proceed
      const results = await Promise.allSettled(promises);

      const successCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failCount = results.filter((r) => r.status === "rejected").length;

      console.log(
        `Monthly newsletter broadcast complete. Success: ${successCount}, Failed: ${failCount}`,
      );
    } catch (error) {
      console.error("Critical error in monthly newsletter cron job:", error);
    }
  });

  console.log("Newsletter Cron Job fully registered.");
};

module.exports = initNewsletterCron;
