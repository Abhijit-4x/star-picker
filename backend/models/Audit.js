const mongoose = require("mongoose");

const AuditSchema = new mongoose.Schema({
  starName: {
    type: String,
    required: true,
  },
  tier: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  starId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Star",
    default: null, // null for new stars, ObjectId for existing stars
  },
  auditType: {
    type: String,
    enum: ["create", "update", "delete"],
    required: true,
  },
  comment: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Audit", AuditSchema);
