const mongoose = require('mongoose');

const StarCacheSchema = new mongoose.Schema({
     _id: {
        type: String,
        required: true
    },

    recentStarIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Star'
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

const StarCache = mongoose.model('StarCache', StarCacheSchema);
module.exports = StarCache;