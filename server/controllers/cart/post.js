const Cart = require("../../models/Cart/cart");
const Product = require("../../models/Product/product");

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const { isValidObjectId } = require("mongoose");

    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({ message: "Valid Product ID is required" });
    }

    if (quantity && (isNaN(quantity) || quantity <= 0)) {
      return res
        .status(400)
        .json({ message: "Quantity must be a positive number" });
    }

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
    console.error(
      "Error in server/controllers/cart/post.js (addToCart):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addToCart,
};
