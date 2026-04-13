const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  apiId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['anime', 'manga', 'movie', 'tv'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  titleEnglish: String,
  description: String,
  image: String,
  bannerImage: String,
  genres: [String],
  status: String,
  totalEpisodes: Number,
  totalChapters: Number,
  totalVolumes: Number,
  year: Number,
  score: Number,
  duration: Number, // for movies in minutes
  source: String,
  studios: [String]
}, { timestamps: true });

// Compound index to prevent duplicates
mediaSchema.index({ apiId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Media', mediaSchema);
