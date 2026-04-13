const express = require('express');
const router = express.Router();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p';
const API_KEY = process.env.TMDB_API_KEY || 'bbca432b0139e83d0b15f28f448b0f50';

// Limit proxy requests directly from frontend users if necessary, but we already have a ratelimiter.

router.get('/search/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { query, page } = req.query;
    
    const url = new URL(`${TMDB_BASE_URL}/search/${type}`);
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('language', 'en-US');
    if (query) url.searchParams.set('query', query);
    if (page) url.searchParams.set('page', page);

    const response = await fetch(url.toString());
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('TMDB Search Error:', err);
    res.status(500).json({ error: 'Proxy fetch failed' });
  }
});

router.get('/detail/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    
    const url = new URL(`${TMDB_BASE_URL}/${type}/${id}`);
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('append_to_response', 'credits,videos,similar');

    const response = await fetch(url.toString());
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('TMDB Detail Error:', err);
    res.status(500).json({ error: 'Proxy fetch failed' });
  }
});

router.get('/image/:size/*', async (req, res) => {
  try {
    const { size } = req.params;
    const path = req.params[0];
    const url = `${TMDB_IMAGE_URL}/${size}/${path}`;
    
    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).send('Not found');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (err) {
    console.error('TMDB Image Error:', err);
    res.status(500).send('Image fetch failed');
  }
});

module.exports = router;
