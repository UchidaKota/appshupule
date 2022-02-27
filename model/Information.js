const mongoose = require('mongoose');
const mongooseLeanVirtuals = require('mongoose-lean-virtuals');

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
      type: Buffer
    },
    coverImageType: {
      type: String
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

InformationSchema.plugin(mongooseLeanVirtuals);


module.exports = mongoose.model('Information', InformationSchema);