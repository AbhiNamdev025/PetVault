const Order = require("../../models/Order/order");

const deleteOrder = async (req, res) => {
  try {
    const { isValidObjectId } = require("mongoose");
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Order ID format" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    await order.deleteOne();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(
      "Error in server/controllers/order/delete.js (deleteOrder):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  deleteOrder,
};
