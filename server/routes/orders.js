const express = require("express");
const Order = require("../models/order")
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/", protect, admin, getAllOrders);
router.put("/:id/status", protect, updateOrderStatus); 
router.delete("/:id", protect, admin, deleteOrder);

router.get("/shop/:shopId", protect, async (req, res) => {
  try {
    const orders = await Order.find({ 
      "items.shopId": req.params.shopId 
    })
    .populate("user", "name email")
    .populate("items.product")
    .populate("items.pet")
    .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;