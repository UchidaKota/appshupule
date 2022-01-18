const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    information: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Information',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
});

module.exports = mongoose.model('Like', LikeSchema);