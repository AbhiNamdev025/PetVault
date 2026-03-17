const mongoose = require("mongoose");

const payoutBankDetailsSchema = new mongoose.Schema(
  {
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    branchName: {
      type: String,
      trim: true,
      default: "",
    },
    upiId: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
  },
  { _id: false },
);

const providerPayoutSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerRole: {
      type: String,
      enum: ["shop", "doctor", "caretaker", "hospital", "daycare", "ngo"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    platformFeePercent: {
      type: Number,
      default: 3,
      min: 0,
      max: 100,
    },
    platformFeeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProviderBankAccount",
      index: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "processing",
        "disbursed",
        "rejected",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    providerNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },
    adminNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    disbursementReference: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    paymentMode: {
      type: String,
      enum: ["", "bank_transfer", "upi", "imps", "neft", "rtgs", "manual"],
      default: "",
      trim: true,
    },
    utrNumber: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    transactionId: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    payoutProofImage: {
      type: String,
      trim: true,
      default: "",
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    disbursedAt: {
      type: Date,
    },
    bankDetails: {
      type: payoutBankDetailsSchema,
      required: true,
    },
    totalEarningsAtRequest: {
      type: Number,
      default: 0,
    },
    availableAtRequest: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

providerPayoutSchema.index({ provider: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("ProviderPayout", providerPayoutSchema);
