const express = require('express');
const jwt = require('jsonwebtoken');
const Recipe = require('../models/Recipe');

const router = express.Router();

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'forgeai-admin-secret-change-me';

// Inline admin authentication middleware
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired admin token' });
  }
};

// GET / - Public list route (returns plain array)
router.get('/', async (req, res, next) => {
  try {
    const { cuisine, category, search, status, limit } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }
    if (cuisine && cuisine !== 'All') {
      query.cuisine = cuisine;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } },
        { cuisine: { $regex: search, $options: 'i' } }
      ];
    }

    let queryExec = Recipe.find(query).sort({ createdAt: -1 });

    if (limit) {
      const parsedLimit = parseInt(limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        queryExec = queryExec.limit(parsedLimit);
      }
    }

    const recipes = await queryExec;
    res.json(recipes);
  } catch (err) {
    next(err);
  }
});

// GET /:id - Public single recipe lookup
router.get('/:id', async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    next(err);
  }
});

// POST / - Public creation endpoint (user submissions or admin creation)
router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      cuisine,
      category,
      imageUrl,
      ingredients,
      instructions,
      youtubeUrl,
      source,
      status,
      mealDbId,
      submittedBy,
      averageRating
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Recipe name is required' });
    }

    const newRecipe = new Recipe({
      name: name.trim(),
      cuisine: cuisine ? cuisine.trim() : 'Global',
      category: category ? category.trim() : 'Miscellaneous',
      imageUrl: imageUrl || '',
      ingredients: ingredients || '',
      instructions: instructions || '',
      youtubeUrl: youtubeUrl || '',
      source: source || 'User Submission',
      status: status || 'pending',
      mealDbId: mealDbId || '',
      submittedBy: submittedBy ? submittedBy.trim() : 'Anonymous Chef',
      averageRating: typeof averageRating === 'number' ? averageRating : 0
    });

    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// PUT /:id - Admin only recipe update
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const updates = req.body;
    const allowedFields = [
      'name',
      'cuisine',
      'category',
      'imageUrl',
      'ingredients',
      'instructions',
      'youtubeUrl',
      'source',
      'status',
      'mealDbId',
      'submittedBy',
      'averageRating'
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        recipe[field] = updates[field];
      }
    });

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } catch (err) {
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// DELETE /:id - Admin only recipe deletion
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted successfully', id: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }
    next(err);
  }
});

module.exports = router;