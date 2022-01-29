const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    information: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Information',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    comment: {
        type: String,
        required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
});

module.exports = mongoose.model('Comment', CommentSchema);