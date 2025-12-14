const mongoose = require("mongoose");

const StarCacheSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recentStarIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Star",
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries by userId
StarCacheSchema.index({ userId: 1 });

const StarCache = mongoose.model("StarCache", StarCacheSchema);
module.exports = StarCache;
