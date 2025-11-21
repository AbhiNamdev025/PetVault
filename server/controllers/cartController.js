const Cart = require("../models/cart");
const Product = require("../models/product");

const getCartItems = async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.user._id }).populate("productId");
    res.json({ cartItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existingItem = await Cart.findOne({
      userId: req.user._id,
      productId: productId,
    });

    if (existingItem) {
      existingItem.quantity += quantity || 1;
      await existingItem.save();
      return res.json(existingItem);
    }

    const newItem = await Cart.create({
      userId: req.user._id,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      description: product.description,
      quantity: quantity || 1,
      shopId: product.shopId, 
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; 
    const { quantity } = req.body;

    const cartItem = await Cart.findById(id);
    if (!cartItem) return res.status(404).json({ message: "Item not found" });

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Cart.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.user._id });
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};