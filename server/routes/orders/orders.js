const express = require("express");

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getOrdersByShopId,
  getOrderById,
} = require("../../controllers/order");
const { protect, admin } = require("../../middleware/Auth/authMiddleware");

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/shop/:shopId", protect, getOrdersByShopId);
router.get("/:id", protect, getOrderById);
router.get("/", protect, admin, getAllOrders);
router.put("/:id/status", protect, updateOrderStatus);
router.delete("/:id", protect, admin, deleteOrder);

module.exports = router;
