const Cart = require("../../models/Cart/cart");

const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }

    const deleted = await Cart.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error(
      "Error in server/controllers/cart/delete.js (removeCartItem):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.user._id });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    console.error(
      "Error in server/controllers/cart/delete.js (clearCart):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  removeCartItem,
  clearCart,
};
