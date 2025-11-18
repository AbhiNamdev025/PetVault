const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String },
    phone: { type: String, trim: true },

    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },

    avatar: String,
    googleId: { type: String, sparse: true },

    role: {
      type: String,
      enum: [
        "user",
        "daycare",
        "caretaker",
        "hospital",
        "doctor",
        "shop",
        "ngo",
        "admin",
      ],
      default: "user",
    },

    availability: {
      available: { type: Boolean, default: false },
      startTime: String,
      endTime: String,
      days: [String],
      serviceRadius: Number,
      statusNote: String,
    },

    roleData: {
      daycareName: String,
      daycareDescription: String,
      daycareImages: [String],
      maxPetsAllowed: Number,

      daycareStaffIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

      staffSpecialization: String,
      staffExperience: Number,

      hospitalName: String,
      hospitalDescription: String,
      hospitalImages: [String],
      hospitalServices: [String],

      hospitalDoctorIds: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      ],

      doctorName: String,
      doctorSpecialization: String,
      doctorExperience: Number,
      doctorCertificates: String,
      consultationFee: Number,
      doctorImages: [String],

      serviceType: String,
      serviceDescription: String,
      serviceImages: [String],
      hourlyRate: Number,

      shopName: String,
      shopDescription: String,
      shopImages: [String],

      openTime: String,
      closeTime: String,
      daysOpen: [String],

      shopType: {
        type: String,
        enum: ["petStore", "groomingCenter", "medicalStore", "mixed"],
      },

      servicesOffered: [String],

      deliveryAvailable: { type: Boolean, default: false },
      deliveryRadius: Number,

      groomingAvailable: { type: Boolean, default: false },
      groomingServices: [String],

      products: [
        {
          productName: String,
          price: Number,
          brand: String,
          stock: Number,
          image: String,
          category: String,
        },
      ],
    },

    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        review: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
