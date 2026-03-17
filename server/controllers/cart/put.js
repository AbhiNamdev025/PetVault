const Cart = require("../../models/Cart/cart");

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }

    const cartItem = await Cart.findById(id);
    if (!cartItem) return res.status(404).json({ message: "Item not found" });

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json(cartItem);
  } catch (error) {
    console.error(
      "Error in server/controllers/cart/put.js (updateCartItem):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateCartItem,
};
