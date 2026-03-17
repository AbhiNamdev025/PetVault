const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    name: { type: String, required: true, trim: true },

    category: {
      type: String,
      required: true,
      enum: ["food", "toy", "accessory", "health", "grooming", "bedding"],
    },

    price: { type: Number, required: true },

    description: { type: String, required: true },

    images: [String],

    stock: { type: Number, required: true, min: 0 },

    brand: String,

    features: [String],

    available: { type: Boolean, default: true },

    rating: { type: Number, min: 0, max: 5, default: 0 },
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
