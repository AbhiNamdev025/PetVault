const mongoose = require("mongoose");

const deletionLogSchema = new mongoose.Schema(
  {
    listing_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    listing_type: {
      type: String,
      required: true,
      enum: ["product", "pet", "service", "hospital", "daycare", "other"],
      index: true,
    },
    listing_details: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    listing_image: {
      type: String, // Store the primary image filename/URL
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    owner_email: {
      type: String,
      required: true,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deletion_reason: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    email_sent: {
      type: Boolean,
      default: false,
    },
    email_sent_at: {
      type: Date,
    },
    email_retry_count: {
      type: Number,
      default: 0,
    },
    email_error: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient querying
deletionLogSchema.index({ createdAt: -1 });
deletionLogSchema.index({ owner_id: 1, createdAt: -1 });
deletionLogSchema.index({ admin_id: 1, createdAt: -1 });
deletionLogSchema.index({ listing_type: 1, createdAt: -1 });

module.exports = mongoose.model("DeletionLog", deletionLogSchema);
