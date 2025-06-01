const mongoose = require('mongoose');

const StarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Star', StarSchema);
