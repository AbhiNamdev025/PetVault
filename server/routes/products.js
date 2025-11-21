const express = require("express");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getProductsByShop,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");
const { uploadProductImages } = require("../middleware/upload");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", protect, uploadProductImages, createProduct);
router.put("/:id", protect, uploadProductImages, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.delete("/:id/image/:imageName", protect, deleteProductImage);
router.get("/shop/:shopId", getProductsByShop);

module.exports = router;