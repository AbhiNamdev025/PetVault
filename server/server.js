const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const connectDB = require("./config/Database/dataBase");
const passport = require("./config/Passport/passPort");
const { startReminderScheduler } = require("./utils/reminders");
const initNewsletterCron = require("./cron/newsletterCron");

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROUTES
app.use("/api", require("./routes"));

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "PetVault API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

startReminderScheduler();
initNewsletterCron();
