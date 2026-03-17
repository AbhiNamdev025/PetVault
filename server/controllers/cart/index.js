const { getCartItems } = require("./get");
const { addToCart } = require("./post");
const { updateCartItem } = require("./put");
const { removeCartItem, clearCart } = require("./delete");

module.exports = {
  getCartItems,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
