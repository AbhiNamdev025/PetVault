const fs = require("fs");
const path = require("path");
const Product = require("../../models/Product/product");

const deleteProduct = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Validate deletion reason (mandatory)
    const { deletion_reason } = req.body;
    if (!deletion_reason || deletion_reason.trim().length < 10) {
      return res.status(400).json({
        message: "Deletion reason is required (minimum 10 characters)",
      });
    }

    const product = await Product.findById(req.params.id).populate(
      "shopId",
      "name email",
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Get admin user from request (set by protect middleware)
    const adminId = req.user._id;

    // Create deletion log
    const DeletionLog = require("../../models/DeletionLog/deletionLog");
    const User = require("../../models/User/user");

    const owner = await User.findById(product.shopId._id || product.shopId);
    if (!owner) {
      return res.status(404).json({ message: "Product owner not found" });
    }

    const deletionLog = await DeletionLog.create({
      listing_id: product._id,
      listing_type: "product",
      listing_details: {
        name: product.name,
        category: product.category,
        price: product.price,
        brand: product.brand,
        description: product.description,
      },
      listing_image: product.images?.[0] || null, // Capture primary image
      owner_id: owner._id,
      owner_email: owner.email,
      admin_id: adminId,
      deletion_reason: deletion_reason.trim(),
    });

    // Original deletion logic (unchanged)
    // Archive instead of permanent delete
    // if (product.images && product.images.length > 0) {
    //   product.images.forEach((img) => {
    //     const imgPath = path.join(
    //       __dirname,
    //       "..",
    //       "..",
    //       "uploads",
    //       "products",
    //       img,
    //     );
    //     if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    //   });
    // }
    product.isArchived = true;
    await product.save();

    // Queue email notification (async, non-blocking)
    const { processDeletionEmailQueue } = require("../../utils/emailService");
    setImmediate(() => {
      processDeletionEmailQueue(deletionLog._id);
    });

    res.json({
      message: "Product deleted successfully",
      deletion_log_id: deletionLog._id,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/product/delete.js (deleteProduct):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const { id, imageName } = req.params;
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const imgPath = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "products",
      imageName,
    );
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    product.images = product.images.filter((img) => img !== imageName);
    await product.save();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error(
      "Error in server/controllers/product/delete.js (deleteProductImage):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  deleteProduct,
  deleteProductImage,
};
