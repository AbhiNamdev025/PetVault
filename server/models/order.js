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
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
