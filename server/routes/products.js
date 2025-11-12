const express = require("express");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");
const { uploadProductImages } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/create", protect, admin, uploadProductImages, createProduct);
router.put("/:id", protect, admin, uploadProductImages, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.delete("/:id/image/:imageName", protect, admin, deleteProductImage);

module.exports = router;
