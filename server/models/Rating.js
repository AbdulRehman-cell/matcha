const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    recipeId: {
      type: String,
      required: true,
      index: true
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      default: ''
    },
    authorName: {
      type: String,
      trim: true,
      default: 'Anonymous Foodie'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Rating', ratingSchema);