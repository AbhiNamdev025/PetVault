const mongoose = require("mongoose");

const coinLedgerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["earn", "spend", "adjust"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      default: 0,
    },
    sourceType: {
      type: String,
      default: "",
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CoinLedger", coinLedgerSchema);
