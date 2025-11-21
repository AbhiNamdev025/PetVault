const fs = require("fs");
const path = require("path");
const Product = require("../models/product");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("shopId", "name businessName")
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "shopId",
      "name businessName"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const uploadedFiles = req.files?.productImages || [];
    const imageNames = uploadedFiles.map((f) => f.filename);
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
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const { id } = req.params;
    const existing = await Product.findById(id);
    if (!existing)
      return res.status(404).json({ message: "Product not found" });

    const uploadedFiles = req.files?.productImages || [];
    const newImageNames = uploadedFiles.map((file) => file.filename);
    let updatedImages = existing.images;

    if (req.body.replaceImages === "true") {
      existing.images.forEach((img) => {
        const imgPath = path.join(__dirname, "..", "uploads", "products", img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
      updatedImages = newImageNames;
    } else if (newImageNames.length > 0) {
      updatedImages = [...existing.images, ...newImageNames];
    }

    const updateData = {
      ...req.body,
      price: req.body.price ? parseFloat(req.body.price) : existing.price,
      stock: req.body.stock ? parseInt(req.body.stock) : existing.stock,
      rating: req.body.rating ? parseFloat(req.body.rating) : existing.rating,
      features: req.body.features
        ? req.body.features.split(",").map((f) => f.trim())
        : existing.features,
      images: updatedImages,
    };

    await Product.findByIdAndUpdate(id, updateData, { new: true });
    const refreshed = await Product.findById(id);
    res.json(refreshed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        const imgPath = path.join(__dirname, "..", "uploads", "products", img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }
    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const { id, imageName } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const imgPath = path.join(
      __dirname,
      "..",
      "uploads",
      "products",
      imageName
    );
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    product.images = product.images.filter((img) => img !== imageName);
    await product.save();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const products = await Product.find({ shopId })
      .populate("shopId", "name businessName email")
      .sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getProductsByShop,
};
