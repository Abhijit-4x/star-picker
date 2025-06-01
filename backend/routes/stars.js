const express = require('express');
const router = express.Router();
const Star = require('../models/Star');

// Get all stars
router.get('/stars', async (req, res) => {
  const stars = await Star.find();
  res.json(stars);
});

// Get a random star
router.get('/random-star', async (req, res) => {
  const count = await Star.countDocuments();
  const random = Math.floor(Math.random() * count);
  const star = await Star.findOne().skip(random);
  res.json(star);
});

module.exports = router;
