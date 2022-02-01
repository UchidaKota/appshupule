const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
    touser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fromuser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
});

module.exports = mongoose.model('Like', LikeSchema);