const Order = require("../../models/Order/order");
const { isValidObjectId } = require("mongoose");

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .populate("items.pet")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(
      "Error in server/controllers/order/get.js (getMyOrders):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product")
      .populate("items.pet")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(
      "Error in server/controllers/order/get.js (getAllOrders):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getOrdersByShopId = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.shopId": req.params.shopId,
    })
      .populate("user", "name email")
      .populate("items.product")
      .populate("items.pet")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(
      "Error in server/controllers/order/get.js (getOrdersByShopId):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid order ID format" });
    }

    const order = await Order.findById(id)
      .populate("user", "name email role")
      .populate("items.product")
      .populate("items.pet");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const requesterId = req.user?._id?.toString();
    const ownerId = order.user?._id?.toString?.() || order.user?.toString?.();
    const isOwner = ownerId === requesterId;
    const isAdmin = req.user?.role === "admin";
    const isRelatedShop = order.items.some(
      (item) => item?.shopId?.toString?.() === requesterId,
    );

    if (!isOwner && !isAdmin && !isRelatedShop) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    console.error(
      "Error in server/controllers/order/get.js (getOrderById):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyOrders,
  getAllOrders,
  getOrdersByShopId,
  getOrderById,
};
