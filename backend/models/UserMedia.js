const mongoose = require('mongoose');

const userMediaSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
    required: true
  },
  type: {
    type: String,
    enum: ['anime', 'manga', 'movie', 'tv'],
    required: true
  },
  userStatus: {
    type: String,
    enum: ['planning', 'watching', 'reading', 'completed', 'dropped', 'on_hold'],
    default: 'planning'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  startDate: Date,
  finishDate: Date
}, { timestamps: true });

// Each user can add a media only once
userMediaSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

module.exports = mongoose.model('UserMedia', userMediaSchema);
