const mongoose = require("mongoose");
const crypto = require("crypto");

const userPetSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    petId: {
      type: String,
      unique: true,
      index: true,
    },
    name: { type: String, required: true },
    species: { type: String, required: true }, // Dog, Cat, etc.
    breed: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Unknown"] },
    dob: { type: Date },
    age: { type: Number },
    ageUnit: { type: String, default: "years" },
    weight: { type: Number }, // in kg
    colorMarks: { type: String },
    identifiableMarks: { type: String },
    profileImage: { type: String },
    originShopId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    originNgoId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    acquisitionType: {
      type: String,
      enum: ["manual", "bought", "adopted"],
      default: "manual",
    },
    status: {
      type: String,
      enum: ["active", "archived", "deceased"],
      default: "active",
    },
    deletedAt: { type: Date },

    // Simple medical history array directly on pet (for permanent records)
    // Appointment-based history will be linked via the Appointments model
    medicalConditions: [String], // Chronic conditions e.g. "Diabetes"
    allergies: [String],
    vaccinations: [
      {
        name: String,
        date: Date,
        nextDueDate: Date,
        administeredBy: String,
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notes: String,
        lastReminderAt: Date,
        lastReminderStage: String,
      },
    ],
  },
  { timestamps: true },
);

userPetSchema.pre("save", function (next) {
  if (!this.petId) {
    const year = new Date().getFullYear();
    const token = crypto.randomBytes(3).toString("hex").toUpperCase();
    this.petId = `PET-${year}-${token}`;
  }
  next();
});

module.exports = mongoose.model("UserPet", userPetSchema);
