const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const Appointment = require("../models/appointment");
const Order = require("../models/order");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "3d",
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const appointments = await Appointment.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("service", "name price");

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("items.product", "name price")
      .populate("items.pet", "name price");

    res.json({ user, appointments, orders });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.name = req.body.name || user.name;
//     user.email = req.body.email || user.email;
//     user.phone = req.body.phone || user.phone;

//     if (req.body.address) {
//       user.address = {
//         street: req.body.address.street || user.address.street,
//         city: req.body.address.city || user.address.city,
//         state: req.body.address.state || user.address.state,
//         zipCode: req.body.address.zipCode || user.address.zipCode,
//       };
//     }

//     if (req.file) {
//       if (user.avatar) {
//         const oldPath = path.join(
//           __dirname,
//           "..",
//           "uploads",
//           "avatars",
//           user.avatar
//         );
//         if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//       }
//       user.avatar = req.file.filename;
//     }

//     const updatedUser = await user.save();
//     res.json(updatedUser);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    user.address = {
      street: req.body["address.street"] || user.address?.street || "",
      city: req.body["address.city"] || user.address?.city || "",
      state: req.body["address.state"] || user.address?.state || "",
      zipCode: req.body["address.zipCode"] || user.address?.zipCode || "",
    };

    if (req.file) {
      if (user.avatar) {
        const oldPath = path.join(
          __dirname,
          "..",
          "uploads",
          "avatars",
          user.avatar
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      user.avatar = req.file.filename;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  checkEmail,
};
