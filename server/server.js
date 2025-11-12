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

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/auth", require("./routes/googleAuthRoutes"));
app.use("/api/pets", require("./routes/pets"));
app.use("/api/products", require("./routes/products"));
app.use("/api/services", require("./routes/services"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api", require("./routes/enquiryRoutes"));

app.use("/api/auth", require("./routes/passwordRoutes"));

//cart
app.use("/api/cart", require("./routes/cartRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "PetVault API is running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
