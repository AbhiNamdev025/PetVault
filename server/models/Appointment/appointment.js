const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    providerType: {
      type: String,
      enum: ["doctor", "caretaker", "ngo", "shop"],
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    service: {
      type: String,
      required: true,
      enum: [
        "vet",
        "daycare",
        "grooming",
        "training",
        "boarding",
        "pet_adoption",
        "shop",
        "others",
      ],
    },
    petName: {
      type: String,
      required: true,
    },
    petType: {
      type: String,
      required: true,
      trim: true,
    },

    parentPhone: {
      type: String,
      required: true,
      match: /^[1-9][0-9]{9}$/,
    },
    date: {
      type: Date,
      required: true,
    },
    selectedDates: {
      type: [Date],
      default: [],
    },
    time: {
      type: String,
      required: true,
    },
    healthIssues: {
      type: String,
      default: "",
    },
    reason: {
      type: String,
      required: true,
    },
    petImages: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: String,
      enum: ["user", "provider", "admin"],
    },
    cancelledAt: {
      type: Date,
    },
    userEmail: {
      type: String,
    },
    userName: {
      type: String,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
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
    paymentMethod: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentInfo: {
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      utrNumber: String,
    },
    paidAt: {
      type: Date,
    },
    onlineRefundedToWalletAmount: {
      type: Number,
      default: 0,
    },
    onlineRefundedToWalletAt: {
      type: Date,
    },
    // New Fields for Health Records
    enquiryPetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserPet", // Optional link to a registered pet
    },
    vaccinations: [
      {
        type: mongoose.Schema.Types.Mixed,
      },
    ],
    doctorNotes: {
      type: String, // Doctor's diagnosis or observation
    },
    diagnosis: {
      type: String, // Short title e.g. "Viral Fever"
    },
    prescription: {
      type: String, // URL to image or text
    },
    followUpDate: {
      type: Date,
    },
    followUpReminderSentAt: {
      type: Date,
    },
    report: {
      type: String, // Filename of uploaded report
    },
    serviceNotes: {
      type: String, // For non-medical services (shops/daycare)
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
