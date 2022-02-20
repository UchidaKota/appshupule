const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
});

module.exports = mongoose.model('Chat', ChatSchema);