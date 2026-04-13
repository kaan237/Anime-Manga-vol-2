const express = require('express');
const Media = require('../models/Media');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/media/sync
// @desc    Sync media data from external API to DB
// @access  Private
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const { apiId, type, title, titleEnglish, description, image, bannerImage, 
            genres, status, totalEpisodes, totalChapters, totalVolumes, year, 
            score, duration, source, studios } = req.body;

    if (!apiId || !type || !title) {
      return res.status(400).json({ error: 'apiId, type, and title are required.' });
    }

    const media = await Media.findOneAndUpdate(
      { apiId: String(apiId), type },
      { apiId: String(apiId), type, title, titleEnglish, description, image, 
        bannerImage, genres, status, totalEpisodes, totalChapters, totalVolumes, 
        year, score, duration, source, studios },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ media });
  } catch (err) {
    console.error('Media sync error:', err);
    res.status(500).json({ error: 'Failed to sync media data.' });
  }
});

// @route   GET /api/media/:id
// @desc    Get media by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media not found.' });
    }
    res.json({ media });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
