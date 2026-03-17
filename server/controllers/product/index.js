const { getAllProducts, getProductById, getProductsByShop } = require("./get");
const { createProduct } = require("./post");
const { updateProduct, restoreProduct } = require("./put");
const { deleteProduct, deleteProductImage } = require("./delete");

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getProductsByShop,
  restoreProduct,
};
