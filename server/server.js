const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const connectDB = require("./config/database");
const passport = require("./config/passPort");

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROUTES

// AUTH (signup + login)
app.use("/api/auth", require("./routes/auth"));

// GOOGLE LOGIN ROUTES
app.use("/api/auth", require("./routes/googleAuthRoutes"));

// USER (profile, update, availability, link staff/doctors)
app.use("/api/user", require("./routes/user"));
app.use("/api/doctor", require("./routes/doctorRoutes"));
app.use("/api/hospital", require("./routes/hospitalRoutes"));
app.use("/api/daycare", require("./routes/daycareRoutes"));
app.use("/api/caretaker", require("./routes/caretakerRoutes"));
app.use("/api/shop", require("./routes/shopRoutes"));
app.use("/api/ngo", require("./routes/ngoRoutes"));

app.use("/api/pets", require("./routes/pets"));
app.use("/api/products", require("./routes/products"));
app.use("/api/services", require("./routes/services"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api", require("./routes/enquiryRoutes"));
app.use("/api/auth", require("./routes/passwordRoutes"));

// CART
app.use("/api/cart", require("./routes/cartRoutes"));

// WHATSAPP
app.use("/api/whatsapp", require("./routes/whatsapp"));

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "PetVault API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
