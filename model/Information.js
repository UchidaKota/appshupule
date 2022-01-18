const mongoose = require('mongoose');

const InformationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'public',
      enum: ['public', 'private'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    like: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
});

module.exports = mongoose.model('Information', InformationSchema);