const express = require('express');
const UserMedia = require('../models/UserMedia');
const Media = require('../models/Media');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/usermedia
// @desc    Get all user's media list
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { type, status, page = 1, limit = 50, favorite } = req.query;
    
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (status) filter.userStatus = status;
    if (favorite === 'true') filter.isFavorite = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [items, total] = await Promise.all([
      UserMedia.find(filter)
        .populate('mediaId')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      UserMedia.countDocuments(filter)
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get userMedia error:', err);
    res.status(500).json({ error: 'Failed to fetch your list.' });
  }
});

// @route   POST /api/usermedia
// @desc    Add media to user's list
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { mediaData, userStatus, progress, score, isFavorite, notes } = req.body;

    if (!mediaData || !mediaData.apiId || !mediaData.type) {
      return res.status(400).json({ error: 'Media data with apiId and type is required.' });
    }

    // Sync media to DB
    const media = await Media.findOneAndUpdate(
      { apiId: String(mediaData.apiId), type: mediaData.type },
      { ...mediaData, apiId: String(mediaData.apiId) },
      { upsert: true, new: true, runValidators: true }
    );

    // Check if already in list
    const existing = await UserMedia.findOne({ 
      userId: req.user._id, 
      mediaId: media._id 
    });
    
    if (existing) {
      return res.status(400).json({ error: 'This media is already in your list.' });
    }

    const userMedia = new UserMedia({
      userId: req.user._id,
      mediaId: media._id,
      type: mediaData.type,
      userStatus: userStatus || 'planning',
      progress: progress || 0,
      score: score || null,
      isFavorite: isFavorite || false,
      notes: notes || ''
    });

    await userMedia.save();
    await userMedia.populate('mediaId');

    res.status(201).json({ 
      message: 'Added to your list!',
      item: userMedia 
    });
  } catch (err) {
    console.error('Add userMedia error:', err);
    res.status(500).json({ error: 'Failed to add to your list.' });
  }
});

// @route   PUT /api/usermedia/:id
// @desc    Update user media entry
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { userStatus, progress, score, isFavorite, notes, startDate, finishDate } = req.body;

    const userMedia = await UserMedia.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!userMedia) {
      return res.status(404).json({ error: 'Entry not found in your list.' });
    }

    if (userStatus !== undefined) userMedia.userStatus = userStatus;
    if (progress !== undefined) userMedia.progress = progress;
    if (score !== undefined) userMedia.score = score;
    if (isFavorite !== undefined) userMedia.isFavorite = isFavorite;
    if (notes !== undefined) userMedia.notes = notes;
    if (startDate !== undefined) userMedia.startDate = startDate;
    if (finishDate !== undefined) userMedia.finishDate = finishDate;

    // Auto set finish date when completed
    if (userStatus === 'completed' && !userMedia.finishDate) {
      userMedia.finishDate = new Date();
    }

    await userMedia.save();
    await userMedia.populate('mediaId');

    res.json({ 
      message: 'Updated successfully!',
      item: userMedia 
    });
  } catch (err) {
    console.error('Update userMedia error:', err);
    res.status(500).json({ error: 'Failed to update entry.' });
  }
});

// @route   DELETE /api/usermedia/:id
// @desc    Remove media from user's list
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const userMedia = await UserMedia.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!userMedia) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    res.json({ message: 'Removed from your list.' });
  } catch (err) {
    console.error('Delete userMedia error:', err);
    res.status(500).json({ error: 'Failed to remove entry.' });
  }
});

// @route   GET /api/usermedia/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    const [stats, typeBreakdown, recentlyUpdated] = await Promise.all([
      UserMedia.aggregate([
        { $match: { userId } },
        { $group: {
          _id: '$userStatus',
          count: { $sum: 1 }
        }}
      ]),
      UserMedia.aggregate([
        { $match: { userId } },
        { $group: {
          _id: '$type',
          count: { $sum: 1 },
          completed: { 
            $sum: { $cond: [{ $eq: ['$userStatus', 'completed'] }, 1, 0] }
          },
          totalProgress: { $sum: '$progress' }
        }}
      ]),
      UserMedia.find({ userId })
        .populate('mediaId')
        .sort({ updatedAt: -1 })
        .limit(6)
    ]);

    // Calculate total watch time (assume 24 min per anime episode, 90 min per movie)
    const animeStats = typeBreakdown.find(t => t._id === 'anime');
    const movieStats = typeBreakdown.find(t => t._id === 'movie');
    const tvStats = typeBreakdown.find(t => t._id === 'tv');
    
    const totalMinutes = 
      ((animeStats?.totalProgress || 0) * 24) +
      ((movieStats?.count || 0) * 90) +
      ((tvStats?.totalProgress || 0) * 45);

    const statusMap = {};
    stats.forEach(s => { statusMap[s._id] = s.count; });

    res.json({
      statusBreakdown: statusMap,
      typeBreakdown,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60),
      recentlyUpdated
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

module.exports = router;
