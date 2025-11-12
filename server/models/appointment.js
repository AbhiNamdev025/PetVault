const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: String,
      required: true,
      enum: ["vet", "daycare", "grooming", "training", "boarding", "others"],
    },
    petName: {
      type: String,
      required: true,
    },
    petType: {
      type: String,
      required: true,
      enum: ["Dog", "Cat", "Bird", "Others"],
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
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
