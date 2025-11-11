const express = require("express");
const {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getCartItems);
router.post("/add", protect, addToCart);
router.put("/update/:id", protect, updateCartItem);
router.delete("/remove/:id", protect, removeCartItem);
router.delete("/clear", protect, clearCart);

module.exports = router;
