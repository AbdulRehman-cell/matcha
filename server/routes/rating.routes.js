const express = require('express');
const jwt = require('jsonwebtoken');
const Rating = require('../models/Rating');
const Recipe = require('../models/Recipe');

const router = express.Router();

// Inline admin verification middleware
const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

  try {
    const decoded = jwt.verify(token, secret);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Helper function to recalculate recipe's average rating
const updateRecipeAverageRating = async (recipeId) => {
  if (!recipeId) return;
  try {
    const ratings = await Rating.find({ recipeId });
    if (ratings.length === 0) {
      await Recipe.findByIdAndUpdate(recipeId, { averageRating: 0 });
      return;
    }
    const sum = ratings.reduce((acc, curr) => acc + (Number(curr.stars) || 0), 0);
    const avg = Math.round((sum / ratings.length) * 10) / 10;
    await Recipe.findByIdAndUpdate(recipeId, { averageRating: avg });
  } catch (err) {
    console.error('Failed to update recipe average rating:', err);
  }
};

// GET /api/ratings - Public: List all ratings (optional query filter by recipeId)
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.recipeId) {
      filter.recipeId = req.query.recipeId;
    }
    const ratings = await Rating.find(filter).sort({ createdAt: -1 });
    // ALWAYS return plain array
    res.json(ratings);
  } catch (err) {
    next(err);
  }
});

// GET /api/ratings/:id - Public: Get single rating by ID
router.get('/:id', async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    res.json(rating);
  } catch (err) {
    next(err);
  }
});

// POST /api/ratings - Public: Create a new rating/comment
router.post('/', async (req, res, next) => {
  try {
    const { recipeId, stars, comment, authorName } = req.body;

    if (!recipeId) {
      return res.status(400).json({ error: 'recipeId is required' });
    }

    const numericStars = Number(stars);
    if (isNaN(numericStars) || numericStars < 1 || numericStars > 5) {
      return res.status(400).json({ error: 'stars must be a number between 1 and 5' });
    }

    const newRating = new Rating({
      recipeId,
      stars: numericStars,
      comment: comment || '',
      authorName: authorName || 'Anonymous Foodie',
      createdAt: new Date()
    });

    const savedRating = await newRating.save();

    // Recalculate average rating on the associated recipe
    await updateRecipeAverageRating(recipeId);

    res.status(201).json(savedRating);
  } catch (err) {
    next(err);
  }
});

// PUT /api/ratings/:id - requireAdmin only: Update a rating
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { stars, comment, authorName } = req.body;
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    if (stars !== undefined) {
      const numericStars = Number(stars);
      if (isNaN(numericStars) || numericStars < 1 || numericStars > 5) {
        return res.status(400).json({ error: 'stars must be a number between 1 and 5' });
      }
      rating.stars = numericStars;
    }

    if (comment !== undefined) rating.comment = comment;
    if (authorName !== undefined) rating.authorName = authorName;

    const updatedRating = await rating.save();

    // Recalculate average rating on the associated recipe
    await updateRecipeAverageRating(rating.recipeId);

    res.json(updatedRating);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ratings/:id - requireAdmin only: Delete a rating
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const rating = await Rating.findByIdAndDelete(req.params.id);
    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Recalculate average rating on the associated recipe
    await updateRecipeAverageRating(rating.recipeId);

    res.json({ message: 'Rating deleted successfully', id: req.params.id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;