const User = require("../models/user");
const Pet = require("../models/pet");
const Product = require("../models/product");
const Service = require("../models/service");
const Appointment = require("../models/appointment");
const Order = require("../models/order");

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPets = await Pet.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalOrders = await Order.countDocuments();

    const recentAppointments = await Appointment.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalPets,
        totalProducts,
        totalAppointments,
        totalOrders,
      },
      recentAppointments,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
};
