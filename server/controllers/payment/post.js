const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../../models/Order/order");
const Appointment = require("../../models/Appointment/appointment");
const {
  sendNotification,
  sendAdminNotification,
} = require("../../utils/pushNotification");
const { creditWallet, roundCurrency } = require("../../utils/wallet");

const HIGH_VALUE_THRESHOLD = Number(
  process.env.HIGH_VALUE_TRANSACTION_THRESHOLD || 50000,
);

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay keys not found in environment variables");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPaymentOrder = async (req, res) => {
  try {
    console.log("CREATE PAYMENT BODY:", req.body);
    console.log("RZP KEY:", process.env.RAZORPAY_KEY_ID);

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const orderRecord = await Order.findById(orderId);
    if (!orderRecord) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (orderRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (orderRecord.paymentMethod !== "Online") {
      return res.status(400).json({ message: "Order is not Online payment" });
    }

    if (orderRecord.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    if ((orderRecord.totalAmount || 0) <= 0) {
      return res
        .status(400)
        .json({ message: "Order total is already settled with coins" });
    }

    const amount = Number(orderRecord.totalAmount || 0);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { orderId: orderRecord._id.toString() },
    });

    orderRecord.paymentInfo = {
      ...(orderRecord.paymentInfo || {}),
      razorpay_order_id: order.id,
    };
    await orderRecord.save();

    return res.status(200).json(order);
  } catch (error) {
    console.error(
      "Error in server/controllers/payment/post.js (createPaymentOrder):",
      error,
    );
    return res.status(500).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment fields",
      });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET.trim())
      .update(payload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Signature mismatch",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.paymentInfo?.razorpay_order_id &&
      order.paymentInfo.razorpay_order_id !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order mismatch",
      });
    }

    const wasPaid = order.paymentStatus === "paid";
    const wasCancelled = order.status === "cancelled";
    order.paymentStatus = "paid";
    order.paidAt = new Date();
    if (!wasCancelled) {
      order.status = "confirmed";
    }
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const utr =
      payment.acquirer_data?.rrn ||
      payment.acquirer_data?.upi_transaction_id ||
      payment.acquirer_data?.bank_transaction_id ||
      null;
    order.paymentInfo = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      utrNumber: utr,
    };

    await order.save();

    let autoRefundedAmount = 0;
    if (wasCancelled) {
      const refundableOnlineToWallet = Math.max(
        0,
        Number(order.totalAmount || 0) -
          Number(order.onlineRefundedToWalletAmount || 0),
      );
      if (refundableOnlineToWallet > 0) {
        const walletRefundResult = await creditWallet({
          userId: order.user,
          amount: refundableOnlineToWallet,
          sourceType: "order_online_refund",
          sourceId: order._id,
          note: `Online payment refund for cancelled order ${order.invoiceNumber}`,
          dedupe: true,
        });

        if (walletRefundResult.changed && walletRefundResult.amount > 0) {
          autoRefundedAmount = roundCurrency(walletRefundResult.amount);
          order.onlineRefundedToWalletAmount = roundCurrency(
            Number(order.onlineRefundedToWalletAmount || 0) +
              walletRefundResult.amount,
          );
          order.onlineRefundedToWalletAt = new Date();
          await order.save();
        }
      }
    }

    if (!wasPaid) {
      if (wasCancelled) {
        const refundText =
          autoRefundedAmount > 0
            ? ` Amount ₹${autoRefundedAmount.toFixed(2)} credited to wallet.`
            : "";
        await sendNotification(order.user, {
          title: "Payment Captured After Cancellation",
          body: `Order ${order.invoiceNumber} was already cancelled.${refundText}`,
          icon: "/pwa-192x192.png",
          type: "PAYMENT_SUCCESS",
          data: { url: "/profile?tab=wallet", orderId: order._id },
        });
      } else {
        await sendNotification(order.user, {
          title: "Payment Successful",
          body: `Payment received for order ${order.invoiceNumber}.`,
          icon: "/pwa-192x192.png",
          type: "PAYMENT_SUCCESS",
          data: { url: "/my-orders", orderId: order._id },
        });
      }

      if (order.totalAmount >= HIGH_VALUE_THRESHOLD) {
        await sendAdminNotification({
          title: "High Value Transaction",
          body: `Order ${order.invoiceNumber} paid: ₹${order.totalAmount}.`,
          icon: "/pwa-192x192.png",
          type: "HIGH_VALUE_TRANSACTION",
          data: { url: "/admin/orders", orderId: order._id },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment verified & order updated",
      order,
    });
  } catch (err) {
    console.error(
      "Error in server/controllers/payment/post.js (verifyPayment):",
      err,
    );
    res.status(500).json({ success: false });
  }
};

const verifyAppointmentPayment = async (req, res) => {
  try {
    const {
      appointmentId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !appointmentId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment fields",
      });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET.trim())
      .update(payload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Signature mismatch",
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (String(appointment.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (appointment.paymentMethod !== "Online") {
      return res.status(400).json({
        success: false,
        message: "Appointment is not set for online payment",
      });
    }

    if (
      appointment.paymentInfo?.razorpay_order_id &&
      appointment.paymentInfo.razorpay_order_id !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order mismatch",
      });
    }

    const currentPaymentStatus = String(
      appointment.paymentStatus || "",
    ).toLowerCase();
    const existingPaymentId = appointment.paymentInfo?.razorpay_payment_id;
    if (
      existingPaymentId &&
      existingPaymentId === razorpay_payment_id &&
      ["paid", "refunded"].includes(currentPaymentStatus)
    ) {
      return res.status(200).json({
        success: true,
        message: "Appointment payment already verified",
        appointment,
      });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (String(payment?.order_id || "") !== String(razorpay_order_id)) {
      return res.status(400).json({
        success: false,
        message: "Payment does not belong to this Razorpay order",
      });
    }

    const paymentStatus = String(payment?.status || "").toLowerCase();
    if (paymentStatus !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured yet",
      });
    }

    const utr =
      payment.acquirer_data?.rrn ||
      payment.acquirer_data?.upi_transaction_id ||
      payment.acquirer_data?.bank_transaction_id ||
      null;

    const wasCancelled = String(appointment.status || "").toLowerCase() === "cancelled";
    let autoRefundedAmount = 0;

    appointment.paymentInfo = {
      ...(appointment.paymentInfo || {}),
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      utrNumber: utr,
    };
    appointment.paidAt = new Date();

    if (wasCancelled) {
      const refundableOnlineToWallet = Math.max(
        0,
        Number(appointment.totalAmount || 0) -
          Number(appointment.onlineRefundedToWalletAmount || 0),
      );

      if (refundableOnlineToWallet > 0) {
        const walletRefundResult = await creditWallet({
          userId: appointment.user,
          amount: refundableOnlineToWallet,
          sourceType: "appointment_online_refund",
          sourceId: appointment._id,
          note: `Online payment refund for cancelled appointment ${appointment._id}`,
          dedupe: true,
        });

        if (walletRefundResult.changed && walletRefundResult.amount > 0) {
          autoRefundedAmount = roundCurrency(walletRefundResult.amount);
          appointment.onlineRefundedToWalletAmount = roundCurrency(
            Number(appointment.onlineRefundedToWalletAmount || 0) +
              walletRefundResult.amount,
          );
          appointment.onlineRefundedToWalletAt = new Date();
        }
      }

      appointment.paymentStatus =
        Number(appointment.onlineRefundedToWalletAmount || 0) > 0
          ? "refunded"
          : "paid";
    } else {
      appointment.paymentStatus = "paid";
      appointment.status = "confirmed";
    }

    await appointment.save();

    if (wasCancelled) {
      const refundText =
        autoRefundedAmount > 0
          ? ` Amount ₹${autoRefundedAmount.toFixed(2)} credited to wallet.`
          : "";
      await sendNotification(appointment.user, {
        title: "Payment Captured After Cancellation",
        body: `Appointment ${appointment._id} was already cancelled.${refundText}`,
        icon: "/pwa-192x192.png",
        type: "PAYMENT_SUCCESS",
        data: { url: "/profile?tab=wallet", appointmentId: appointment._id },
      });
    } else {
      await sendNotification(appointment.user, {
        title: "Payment Successful",
        body: "Your appointment payment was successful and booking is confirmed.",
        icon: "/pwa-192x192.png",
        type: "PAYMENT_SUCCESS",
        data: { url: "/profile?tab=appointments", appointmentId: appointment._id },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment payment verified",
      appointment,
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/payment/post.js (verifyAppointmentPayment):",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Unable to verify appointment payment",
    });
  }
};

const createAppointmentPaymentOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: "appointmentId is required" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (String(appointment.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (appointment.paymentMethod !== "Online") {
      return res
        .status(400)
        .json({ message: "Appointment is not set for online payment" });
    }

    if (
      !["pending", "confirmed"].includes(String(appointment.status || "").toLowerCase())
    ) {
      return res.status(400).json({
        message: "Appointment is not eligible for payment",
      });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({ message: "Appointment already paid" });
    }

    const amount = Number(appointment.totalAmount || 0);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Appointment total is already settled",
      });
    }

    const paymentOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `apt_${Date.now()}`,
      notes: {
        appointmentId: appointment._id.toString(),
      },
    });

    appointment.paymentInfo = {
      ...(appointment.paymentInfo || {}),
      razorpay_order_id: paymentOrder.id,
    };
    await appointment.save();

    return res.status(200).json(paymentOrder);
  } catch (error) {
    console.error(
      "Error in server/controllers/payment/post.js (createAppointmentPaymentOrder):",
      error,
    );
    return res.status(500).json({ message: error.message });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ message: "Webhook secret not configured" });
    }

    const signature = req.headers["x-razorpay-signature"];
    const rawBody =
      req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    if (!signature || !rawBody) {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    const digest = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (digest !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const payload =
      typeof rawBody === "string"
        ? JSON.parse(rawBody)
        : JSON.parse(rawBody.toString());

    const event = payload.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;

    if (!orderId) {
      return res.status(200).json({ received: true });
    }

    const order = await Order.findOne({
      "paymentInfo.razorpay_order_id": orderId,
    });
    const appointment = order
      ? null
      : await Appointment.findOne({
          "paymentInfo.razorpay_order_id": orderId,
        });

    if (!order && !appointment) {
      return res.status(200).json({ received: true });
    }

    if (order) {
      if (event === "payment.captured") {
        if (order.paymentStatus !== "paid") {
          const wasCancelled = order.status === "cancelled";
          order.paymentStatus = "paid";
          if (!wasCancelled) {
            order.status = "confirmed";
          }
          order.paidAt = new Date(paymentEntity.created_at * 1000);
          order.paymentInfo = {
            ...(order.paymentInfo || {}),
            razorpay_payment_id: paymentEntity.id,
            utrNumber:
              paymentEntity.acquirer_data?.rrn ||
              paymentEntity.acquirer_data?.upi_transaction_id ||
              paymentEntity.acquirer_data?.bank_transaction_id ||
              null,
          };
          await order.save();

          let autoRefundedAmount = 0;
          if (wasCancelled) {
            const refundableOnlineToWallet = Math.max(
              0,
              Number(order.totalAmount || 0) -
                Number(order.onlineRefundedToWalletAmount || 0),
            );
            if (refundableOnlineToWallet > 0) {
              const walletRefundResult = await creditWallet({
                userId: order.user,
                amount: refundableOnlineToWallet,
                sourceType: "order_online_refund",
                sourceId: order._id,
                note: `Online payment refund for cancelled order ${order.invoiceNumber}`,
                dedupe: true,
              });
              if (walletRefundResult.changed && walletRefundResult.amount > 0) {
                autoRefundedAmount = roundCurrency(walletRefundResult.amount);
                order.onlineRefundedToWalletAmount = roundCurrency(
                  Number(order.onlineRefundedToWalletAmount || 0) +
                    walletRefundResult.amount,
                );
                order.onlineRefundedToWalletAt = new Date();
                await order.save();
              }
            }
          }

          if (wasCancelled) {
            const refundText =
              autoRefundedAmount > 0
                ? ` Amount ₹${autoRefundedAmount.toFixed(2)} credited to wallet.`
                : "";
            await sendNotification(order.user, {
              title: "Payment Captured After Cancellation",
              body: `Order ${order.invoiceNumber} was already cancelled.${refundText}`,
              icon: "/pwa-192x192.png",
              type: "PAYMENT_SUCCESS",
              data: { url: "/profile?tab=wallet", orderId: order._id },
            });
          } else {
            await sendNotification(order.user, {
              title: "Payment Successful",
              body: `Payment received for order ${order.invoiceNumber}.`,
              icon: "/pwa-192x192.png",
              type: "PAYMENT_SUCCESS",
              data: { url: "/my-orders", orderId: order._id },
            });
          }

          if (order.totalAmount >= HIGH_VALUE_THRESHOLD) {
            await sendAdminNotification({
              title: "High Value Transaction",
              body: `Order ${order.invoiceNumber} paid: ₹${order.totalAmount}.`,
              icon: "/pwa-192x192.png",
              type: "HIGH_VALUE_TRANSACTION",
              data: { url: "/admin/orders", orderId: order._id },
            });
          }
        }
      }

      if (event === "payment.failed") {
        if (order.paymentStatus !== "paid") {
          order.paymentStatus = "failed";
          await order.save();

          await sendAdminNotification({
            title: "Payment Gateway Failure",
            body: `Payment failed for order ${order.invoiceNumber}.`,
            icon: "/pwa-192x192.png",
            type: "PAYMENT_GATEWAY_FAILURE",
            data: { url: "/admin/orders", orderId: order._id },
          });
        }
      }
    } else if (appointment) {
      if (event === "payment.captured") {
        const paymentStatus = String(appointment.paymentStatus || "").toLowerCase();
        if (!["paid", "refunded"].includes(paymentStatus)) {
          const wasCancelled =
            String(appointment.status || "").toLowerCase() === "cancelled";
          let autoRefundedAmount = 0;

          appointment.paidAt = new Date(paymentEntity.created_at * 1000);
          appointment.paymentInfo = {
            ...(appointment.paymentInfo || {}),
            razorpay_payment_id: paymentEntity.id,
            utrNumber:
              paymentEntity.acquirer_data?.rrn ||
              paymentEntity.acquirer_data?.upi_transaction_id ||
              paymentEntity.acquirer_data?.bank_transaction_id ||
              null,
          };

          if (wasCancelled) {
            const refundableOnlineToWallet = Math.max(
              0,
              Number(appointment.totalAmount || 0) -
                Number(appointment.onlineRefundedToWalletAmount || 0),
            );
            if (refundableOnlineToWallet > 0) {
              const walletRefundResult = await creditWallet({
                userId: appointment.user,
                amount: refundableOnlineToWallet,
                sourceType: "appointment_online_refund",
                sourceId: appointment._id,
                note: `Online payment refund for cancelled appointment ${appointment._id}`,
                dedupe: true,
              });
              if (walletRefundResult.changed && walletRefundResult.amount > 0) {
                autoRefundedAmount = roundCurrency(walletRefundResult.amount);
                appointment.onlineRefundedToWalletAmount = roundCurrency(
                  Number(appointment.onlineRefundedToWalletAmount || 0) +
                    walletRefundResult.amount,
                );
                appointment.onlineRefundedToWalletAt = new Date();
              }
            }
            appointment.paymentStatus =
              Number(appointment.onlineRefundedToWalletAmount || 0) > 0
                ? "refunded"
                : "paid";
          } else {
            appointment.paymentStatus = "paid";
            appointment.status = "confirmed";
          }

          await appointment.save();

          if (wasCancelled) {
            const refundText =
              autoRefundedAmount > 0
                ? ` Amount ₹${autoRefundedAmount.toFixed(2)} credited to wallet.`
                : "";
            await sendNotification(appointment.user, {
              title: "Payment Captured After Cancellation",
              body: `Appointment ${appointment._id} was already cancelled.${refundText}`,
              icon: "/pwa-192x192.png",
              type: "PAYMENT_SUCCESS",
              data: {
                url: "/profile?tab=wallet",
                appointmentId: appointment._id,
              },
            });
          } else {
            await sendNotification(appointment.user, {
              title: "Payment Successful",
              body: "Your appointment payment was successful and booking is confirmed.",
              icon: "/pwa-192x192.png",
              type: "PAYMENT_SUCCESS",
              data: {
                url: "/profile?tab=appointments",
                appointmentId: appointment._id,
              },
            });
          }
        }
      }

      if (event === "payment.failed") {
        if (appointment.paymentStatus !== "paid") {
          appointment.paymentStatus = "failed";
          await appointment.save();
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(
      "Error in server/controllers/payment/post.js (handleWebhook):",
      err,
    );
    res.status(500).json({ received: false });
  }
};

module.exports = {
  createPaymentOrder,
  createAppointmentPaymentOrder,
  verifyPayment,
  verifyAppointmentPayment,
  handleWebhook,
};
