const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["vet", "daycare", "grooming", "training", "boarding"],
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    features: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);
