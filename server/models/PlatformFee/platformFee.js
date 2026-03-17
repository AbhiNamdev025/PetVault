const mongoose = require("mongoose");

const platformFeeSchema = new mongoose.Schema(
  {
    defaultPercent: {
      type: Number,
      default: 2,
      min: 0,
      max: 100,
    },
    roleOverrides: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PlatformFeeConfig", platformFeeSchema);
