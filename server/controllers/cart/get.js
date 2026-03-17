const Cart = require("../../models/Cart/cart");

const getCartItems = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user._id })
      .populate("productId")
      .populate("shopId", "role");
    res.json({ cartItems });
  } catch (error) {
    console.error(
      "Error in server/controllers/cart/get.js (getCartItems):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCartItems,
};
