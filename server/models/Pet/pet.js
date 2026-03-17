const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    type: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    ageUnit: { type: String, default: "months" },
    gender: { type: String, required: true },
    price: { type: Number },
    description: { type: String, required: true },
    color: { type: String, required: true },
    weight: { type: Number },
    identifiableMarks: { type: String },
    medicalConditions: [String],
    allergies: [String],
    dob: { type: Date },
    images: [String],
    vaccinated: { type: Boolean, default: false },
    dewormed: { type: Boolean, default: true },
    available: { type: Boolean, default: true },
    soldToUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    soldAt: { type: Date },
    soldAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    soldUserPetId: { type: mongoose.Schema.Types.ObjectId, ref: "UserPet" },
    category: { type: String, required: true },
    featured: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pet", petSchema);
