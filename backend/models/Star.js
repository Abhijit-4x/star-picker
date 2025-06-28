const mongoose = require('mongoose');

const StarSchema = new mongoose.Schema({
  tier: {
    type: Number,
    required: true,
  },
  starName: {
    type: String,
    required: true,
    unique: true, // Ensure star names are unique
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically set the date when the star is created
  }
});

module.exports = mongoose.model('Star', StarSchema);
