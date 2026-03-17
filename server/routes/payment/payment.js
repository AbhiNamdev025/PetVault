const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  createPaymentOrder,
  createAppointmentPaymentOrder,
  verifyPayment,
  verifyAppointmentPayment,
  handleWebhook,
} = require("../../controllers/payment");
const { protect } = require("../../middleware/Auth/authMiddleware");

router.post("/create-order", protect, createPaymentOrder);
router.post(
  "/create-appointment-order",
  protect,
  createAppointmentPaymentOrder,
);

router.post("/verify", protect, verifyPayment);
router.post("/verify-appointment", protect, verifyAppointmentPayment);

// Razorpay webhook (no auth)
router.post("/webhook", handleWebhook);

module.exports = router;
