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
    images: [String],
    vaccinated: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    category: { type: String, required: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);
