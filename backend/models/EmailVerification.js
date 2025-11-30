const mongoose = require("mongoose");

const EmailVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Auto-delete after 10 minutes (600 seconds)
    },
  },
  { timestamps: false } // We don't need updatedAt for this model
);

// Create TTL index to automatically delete expired documents
EmailVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model("EmailVerification", EmailVerificationSchema);
