const Product = require("../../models/Product/product");

const createProduct = async (req, res) => {
  try {
    const uploadedFiles = req.files?.productImages || [];
    const imageNames = uploadedFiles.map((f) => f.filename);

    const { name, category, price, stock, description } = req.body;

    if (!name || !category || !price || !stock || !description) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    if (isNaN(price) || Number(price) <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }

    if (isNaN(stock) || Number(stock) < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    const validCategories = [
      "food",
      "toy",
      "accessory",
      "health",
      "grooming",
      "bedding",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }
    const productData = {
      ...req.body,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      rating: parseFloat(req.body.rating) || 0,
      features: req.body.features
        ? req.body.features.split(",").map((f) => f.trim())
        : [],
      images: imageNames,
    };
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error(
      "Error in server/controllers/product/post.js (createProduct):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
};
