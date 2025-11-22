const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerType: {
      type: String,
      required: true,
      enum: ["doctor", "caretaker", "ngo", "shop"],
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      enum: [
        "Dog",
        "dog",
        "Cat",
        "cat",
        "Bird",
        "bird",
        "Rabbit",
        "rabbit",
        "Fish",
        "fish",
        "Other",
        "other",
      ],
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
    petImages: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    userEmail: {
      type: String,
    },
    userName: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
