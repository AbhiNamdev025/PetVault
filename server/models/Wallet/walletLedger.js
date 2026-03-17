const mongoose = require("mongoose");

const walletLedgerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
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
      trim: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("WalletLedger", walletLedgerSchema);
