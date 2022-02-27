const mongoose = require('mongoose');

const InformationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    keyword: {
      type: String,
      required: true,
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
    coverImage: {
      type: Buffer,
      required: true
    },
    coverImageType: {
      type: String,
      required: true
    },
    viewUsers:{
      type:Array,
      default:[],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
});

InformationSchema.virtual('coverImagePath').get(function() {
    if (this.coverImage != null && this.coverImageType != null) {
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`;
    }
});


module.exports = mongoose.model('Information', InformationSchema);