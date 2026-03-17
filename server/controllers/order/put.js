const Order = require("../../models/Order/order");
const {
  maybeAwardCoins,
  awardFirstCoins,
  refundSpentCoins,
} = require("../../utils/coins");
const { creditWallet, roundCurrency } = require("../../utils/wallet");

const updateOrderStatus = async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const { isValidObjectId } = require("mongoose");

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid Order ID format" });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const oldStatus = order.status;
    const oldPaymentStatus = order.paymentStatus;
    const refundableCoins = Math.max(
      0,
      Number(order.coinsUsed || 0) - Number(order.coinsRefunded || 0),
    );
    const refundableWalletUsage = Math.max(
      0,
      Number(order.walletUsedAmount || 0) -
        Number(order.walletUsageRefundedAmount || 0),
    );
    const refundableOnlineToWallet = Math.max(
      0,
      Number(order.totalAmount || 0) -
        Number(order.onlineRefundedToWalletAmount || 0),
    );
    let refundedValue = 0;
    let walletRestoredValue = 0;
    let onlineRefundedToWalletValue = 0;
    order.status = status;

    if (status === "cancelled" && cancellationReason) {
      order.cancellationReason = cancellationReason;
    }

    // Fixed: Mark payment as paid if order is delivered, regardless of payment method
    if (status === "delivered" && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
    }

    await order.save();

    if (
      status === "cancelled" &&
      oldStatus !== "delivered" &&
      refundableCoins > 0
    ) {
      const refundResult = await refundSpentCoins({
        userId: order.user,
        coins: refundableCoins,
        sourceType: "order_refund",
        sourceId: order._id,
        spendSourceType: "order",
        note: `Refund for cancelled order ${order.invoiceNumber}`,
      });

      if (refundResult.coinsRefunded > 0) {
        order.coinsRefunded =
          Number(order.coinsRefunded || 0) + refundResult.coinsRefunded;
        order.coinsRefundedValue =
          Number(order.coinsRefundedValue || 0) +
          Number(refundResult.coinsValue || 0);
        refundedValue = Number(refundResult.coinsValue || 0);
        order.coinsRefundedAt = new Date();
        await order.save();
      }
    }

    if (
      status === "cancelled" &&
      oldStatus !== "delivered" &&
      refundableWalletUsage > 0
    ) {
      const restoreResult = await creditWallet({
        userId: order.user,
        amount: refundableWalletUsage,
        sourceType: "order_wallet_restore",
        sourceId: order._id,
        note: `Wallet restored for cancelled order ${order.invoiceNumber}`,
        dedupe: true,
      });

      if (restoreResult.changed && restoreResult.amount > 0) {
        order.walletUsageRefundedAmount = roundCurrency(
          Number(order.walletUsageRefundedAmount || 0) + restoreResult.amount,
        );
        order.walletUsageRefundedAt = new Date();
        walletRestoredValue = roundCurrency(restoreResult.amount);
        await order.save();
      }
    }

    if (
      status === "cancelled" &&
      oldStatus !== "delivered" &&
      order.paymentMethod === "Online" &&
      oldPaymentStatus === "paid" &&
      refundableOnlineToWallet > 0
    ) {
      const onlineRefundResult = await creditWallet({
        userId: order.user,
        amount: refundableOnlineToWallet,
        sourceType: "order_online_refund",
        sourceId: order._id,
        note: `Online payment refund for cancelled order ${order.invoiceNumber}`,
        dedupe: true,
      });

      if (onlineRefundResult.changed && onlineRefundResult.amount > 0) {
        order.onlineRefundedToWalletAmount = roundCurrency(
          Number(order.onlineRefundedToWalletAmount || 0) +
            onlineRefundResult.amount,
        );
        order.onlineRefundedToWalletAt = new Date();
        onlineRefundedToWalletValue = roundCurrency(onlineRefundResult.amount);
        await order.save();
      }
    }

    if (oldStatus !== "delivered" && status === "delivered") {
      const previousDelivered = await Order.countDocuments({
        user: order.user,
        status: "delivered",
        _id: { $ne: order._id },
      });

      if (previousDelivered === 0) {
        await awardFirstCoins({
          userId: order.user,
          category: "order",
          sourceId: order._id,
          note: `First order bonus for ${order.invoiceNumber}`,
        });
      }

      await maybeAwardCoins({
        userId: order.user,
        sourceType: "order",
        sourceId: order._id,
        baseAmount: order.originalAmount || order.totalAmount,
        note: `Reward for delivered order ${order.invoiceNumber}`,
      });
    }

    // Notify User if status changed
    if (oldStatus !== status) {
      const { sendNotification } = require("../../utils/pushNotification");
      const statusTypeMap = {
        shipped: "ORDER_SHIPPED",
        delivered: "ORDER_DELIVERED",
        cancelled: "ORDER_CANCELLED",
      };
      const notificationType = statusTypeMap[status];
      if (notificationType) {
        const refundParts = [];
        if (status === "cancelled" && refundedValue > 0) {
          refundParts.push(`Coins refunded: ₹${refundedValue.toFixed(2)}.`);
        }
        if (status === "cancelled" && walletRestoredValue > 0) {
          refundParts.push(
            `Wallet amount restored: ₹${walletRestoredValue.toFixed(2)}.`,
          );
        }
        if (status === "cancelled" && onlineRefundedToWalletValue > 0) {
          refundParts.push(
            `Online payment credited to wallet: ₹${onlineRefundedToWalletValue.toFixed(2)}.`,
          );
        }
        const refundSuffix = refundParts.length ? ` ${refundParts.join(" ")}` : "";
        await sendNotification(order.user, {
          title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          body: `Your order ${order.invoiceNumber} is now ${status}.${refundSuffix}`,
          icon: "/pwa-192x192.png",
          type: notificationType,
          data: { url: "/my-orders" },
        });
      }
    }

    if (oldPaymentStatus !== "paid" && order.paymentStatus === "paid") {
      const { sendNotification } = require("../../utils/pushNotification");
      await sendNotification(order.user, {
        title: "Payment Successful",
        body: `Payment received for order ${order.invoiceNumber}.`,
        icon: "/pwa-192x192.png",
        type: "PAYMENT_SUCCESS",
        data: { url: "/my-orders" },
      });
    }

    res.json(order);
  } catch (error) {
    console.error(
      "Error in server/controllers/order/put.js (updateOrderStatus):",
      error,
    );
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateOrderStatus,
};
