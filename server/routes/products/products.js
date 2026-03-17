const express = require("express");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getProductsByShop,
  restoreProduct,
} = require("../../controllers/product");
const { protect, admin } = require("../../middleware/Auth/authMiddleware");
const { uploadProductImages } = require("../../middleware/Multer/upload");

const { rateProduct } = require("../../controllers/rating");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/:id/rate", protect, rateProduct);
router.post("/", protect, uploadProductImages, createProduct);
router.put("/:id", protect, uploadProductImages, updateProduct);
router.put("/:id/restore", protect, admin, restoreProduct);
router.delete("/:id", protect, deleteProduct);
router.delete("/:id/image/:imageName", protect, deleteProductImage);
router.get("/shop/:shopId", getProductsByShop);

module.exports = router;
