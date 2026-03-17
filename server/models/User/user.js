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
    hasAcceptedTerms: { type: Boolean, default: false },

    isVerified: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    kycStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    kycDocuments: [String],
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
    adminRemark: String,

    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },

    avatar: String,
    googleId: { type: String, sparse: true },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },

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
      ownerName: String,
      daycareId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      daycareName: String,
      daycareDescription: String,
      daycareImages: [String],
      maxPetsAllowed: Number,
      daycareStaffIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

      staffSpecialization: String,
      staffExperience: Number,
      hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
      doctorQualifications: {
        degree: String,
        institution: String,
        yearOfCompletion: Number,
        licenseNumber: String,
        certifications: [String],
        skills: [String],
        languages: [String],
      },

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

    coins: {
      type: Number,
      default: 0,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    bankDetails: {
      accountHolderName: {
        type: String,
        trim: true,
        default: "",
      },
      bankName: {
        type: String,
        trim: true,
        default: "",
      },
      accountNumber: {
        type: String,
        trim: true,
        default: "",
      },
      ifscCode: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
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
      updatedAt: {
        type: Date,
      },
    },

    pushSubscriptions: [
      {
        endpoint: String,
        keys: {
          p256dh: String,
          auth: String,
        },
      },
    ],
  },
  { timestamps: true },
);

userSchema.pre("save", function (next) {
  if (this.isModified("role") || this.isNew) {
    if (this.role === "user") {
      this.isVerified = true;
      this.kycStatus = "approved";
      this.verifiedAt = new Date();
    } else if (this.isNew) {
      this.isVerified = false;
      this.kycStatus = "pending";
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
