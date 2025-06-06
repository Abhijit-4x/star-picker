const mongoose = require('mongoose');

const StarSchema = new mongoose.Schema({
  tier: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Star', StarSchema);
