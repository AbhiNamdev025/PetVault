const {
  getMyOrders,
  getAllOrders,
  getOrdersByShopId,
  getOrderById,
} = require("./get");
const { createOrder } = require("./post");
const { updateOrderStatus } = require("./put");
const { deleteOrder } = require("./delete");

module.exports = {
  createOrder,
  deleteOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrdersByShopId,
  getOrderById,
};
