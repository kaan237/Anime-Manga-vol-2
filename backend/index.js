const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const mediaRoutes = require('./routes/media');
const userMediaRoutes = require('./routes/userMedia');
const tmdbRoutes = require('./routes/tmdb');

const app = express();

// Trust proxy ayarı (Render'ın yük dengeleyicisi arkasında doğru IP'leri alması için çok önemlidir. Yoksa tüm girenleri ayni kişi sanır.)
app.set('trust proxy', 1);

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limiti artırdım
  message: { error: 'Sistem meşgul, çok fazla işlem yapıldı. Lütfen biraz sonra tekrar deneyin.' }
});

// Middleware
app.use(cors({
  origin: ['https://anime-manga-vol-2.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/usermedia', userMediaRoutes);
app.use('/api/tmdb', tmdbRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = app;
