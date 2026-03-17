const fs = require("fs");
const path = require("path");
const Product = require("../../models/Product/product");

const updateProduct = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!req.params.id || !isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }
    const { id } = req.params;

    if (
      req.body.price &&
      (isNaN(req.body.price) || Number(req.body.price) <= 0)
    ) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }

    if (
      req.body.stock &&
      (isNaN(req.body.stock) || Number(req.body.stock) < 0)
    ) {
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
    if (req.body.category && !validCategories.includes(req.body.category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const existing = await Product.findById(id);
    if (!existing)
      return res.status(404).json({ message: "Product not found" });

    const uploadedFiles = req.files?.productImages || [];
    const newImageNames = uploadedFiles.map((file) => file.filename);
    let updatedImages = existing.images;

    if (req.body.replaceImages === "true") {
      existing.images.forEach((img) => {
        const imgPath = path.join(
          __dirname,
          "..",
          "..",
          "uploads",
          "products",
          img,
        );
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
    console.error(
      "Error in server/controllers/product/put.js (updateProduct):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const restoreProduct = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id).populate({
      path: "shopId",
      select: "name email",
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    product.isArchived = false;
    await product.save();

    // Send notification email
    if (product.shopId && product.shopId.email) {
      const {
        sendRestoreNotificationEmail,
      } = require("../../utils/emailService");
      await sendRestoreNotificationEmail(
        product.shopId.email,
        product.shopId.name,
        "product",
        product.name,
        product.images?.[0],
      );
    }

    res.json({ message: "Product restored successfully", product });
  } catch (error) {
    console.error(
      "Error in server/controllers/product/put.js (restoreProduct):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateProduct,
  restoreProduct,
};
