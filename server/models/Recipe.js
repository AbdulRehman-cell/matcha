const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    cuisine: {
      type: String,
      required: true,
      trim: true,
      default: 'International'
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'Main Course'
    },
    imageUrl: {
      type: String,
      trim: true,
      default: 'https://picsum.photos/seed/recipe1/800/600'
    },
    ingredients: {
      type: String,
      required: true,
      trim: true
    },
    instructions: {
      type: String,
      required: true,
      trim: true
    },
    youtubeUrl: {
      type: String,
      trim: true,
      default: ''
    },
    source: {
      type: String,
      trim: true,
      default: 'Community'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    mealDbId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    submittedBy: {
      type: String,
      trim: true,
      default: 'Guest Chef'
    },
    averageRating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

// Index for search & filter performance
recipeSchema.index({ name: 'text', cuisine: 1, category: 1, status: 1 });

module.exports = mongoose.model('Recipe', recipeSchema);