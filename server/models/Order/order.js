const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"],
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        pet: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Pet",
        },
        shopId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          default: 1,
        },
        image: String,
        brand: String,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },
    originalAmount: {
      type: Number,
      default: 0,
    },
    coinsUsed: {
      type: Number,
      default: 0,
    },
    coinsValue: {
      type: Number,
      default: 0,
    },
    coinsRefunded: {
      type: Number,
      default: 0,
    },
    coinsRefundedValue: {
      type: Number,
      default: 0,
    },
    coinsRefundedAt: {
      type: Date,
    },
    walletUsedAmount: {
      type: Number,
      default: 0,
    },
    walletUsageRefundedAmount: {
      type: Number,
      default: 0,
    },
    walletUsageRefundedAt: {
      type: Date,
    },
    onlineRefundedToWalletAmount: {
      type: Number,
      default: 0,
    },
    onlineRefundedToWalletAt: {
      type: Date,
    },
    platformFee: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    cancellationReason: {
      type: String,
      trim: true,
    },

    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Online", "Coins", "Wallet"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    paymentInfo: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      utrNumber: String,
    },

    invoiceNumber: {
      type: String,
      unique: true,
    },

    paidAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
