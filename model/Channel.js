const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinUsers:{
        type:Array,
        default:[],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
});

module.exports = mongoose.model('Channel', ChannelSchema);