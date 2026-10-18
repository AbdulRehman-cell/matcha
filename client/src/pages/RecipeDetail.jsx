import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, Badge, Spinner, Alert, Textarea, Input } from '../components/ui';

export default function RecipeDetail() {
  const { id } = useParams();
  
  const [recipe, setRecipe] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Rating Form State
  const [ratingValue, setRatingValue] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [ratingError, setRatingError] = useState('');

  // Checked state for ingredients
  const [checkedIngredients, setCheckedIngredients] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchRecipeData();
  }, [id]);

  const fetchRecipeData = async () => {
    setLoading(true);
    setFetchError('');
    setRatingSuccess(false);
    try {
      // 1. Fetch current recipe
      const recipeRes = await axios.get(`/api/recipes/${id}`);
      const recipeData = recipeRes.data;
      setRecipe(recipeData);

      // 2. Fetch ratings for this recipe
      const ratingsRes = await axios.get(`/api/ratings?recipeId=${id}`);
      setRatings(ratingsRes.data || []);

      // 3. Fetch related recipes by cuisine or category
      const relatedRes = await axios.get(`/api/recipes?cuisine=${recipeData.cuisine || ''}`);
      const filteredRelated = (relatedRes.data || [])
        .filter(r => (r._id || r.id) !== id)
        .slice(0, 4);
      setRelatedRecipes(filteredRelated);

    } catch (err) {
      console.error("Error fetching recipe details:", err);
      setFetchError(err.response?.data?.error || 'Failed to load recipe details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (index) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRating(true);
    setRatingError('');
    setRatingSuccess(false);

    try {
      const payload = {
        recipeId: id,
        stars: Number(ratingValue),
        comment,
        authorName: authorName.trim() || 'Anonymous Cook'
      };

      const res = await axios.post('/api/ratings', payload);
      
      // Update local ratings list with new item
      setRatings(prev => [res.data, ...prev]);
      
      // Recalculate average rating locally
      const allStars = [res.data, ...ratings].map(r => Number(r.stars));
      const avg = (allStars.reduce((a, b) => a + b, 0) / allStars.length).toFixed(1);
      
      if (recipe) {
        setRecipe({ ...recipe, averageRating: Number(avg) });
      }

      setRatingSuccess(true);
      setComment('');
      setAuthorName('');
      setRatingValue(5);
    } catch (err) {
      console.error("Error posting rating:", err);
      setRatingError(err.response?.data?.error || 'Failed to post your rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Extract Youtube Embed URL safely
  const getEmbedYoutubeUrl = (url) => {
    if (!url) return null;
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('embed/')) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const getCuisineFlag = (cuisine) => {
    const flags = {
      Italian: '🇮🇹',
      Mexican: '🇲🇽',
      Indian: '🇮🇳',
      Japanese: '🇯🇵',
      Chinese: '🇨🇳',
      American: '🇺🇸',
      French: '🇫🇷',
      Moroccan: '🇲🇦'
    };
    return flags[cuisine] || '🌍';
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <Spinner size="lg" />
        <p className="hero-subtitle" style={{ marginTop: '16px' }}>Fetching recipe secret ingredients...</p>
      </div>
    );
  }

  if (fetchError || !recipe) {
    return (
      <div className="container" style={{ padding: '80px 20px' }}>
        <Alert variant="error" title="Recipe Not Found">
          {fetchError || "We couldn't locate this recipe in our global recipe box."}
        </Alert>
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/browse" className="btn-primary">
            Browse All Recipes
          </Link>
        </div>
      </div>
    );
  }

  // Parse ingredients and instructions
  let ingredientsList = [];
  if (Array.isArray(recipe.ingredients)) {
    ingredientsList = recipe.ingredients;
  } else if (typeof recipe.ingredients === 'string') {
    ingredientsList = recipe.ingredients.split('\n').filter(i => i.trim().length > 0);
  }

  let instructionsList = [];
  if (Array.isArray(recipe.instructions)) {
    instructionsList = recipe.instructions;
  } else if (typeof recipe.instructions === 'string') {
    instructionsList = recipe.instructions.split('\n').filter(i => i.trim().length > 0);
  }

  const embedUrl = getEmbedYoutubeUrl(recipe.youtubeUrl);

  return (
    <div className="recipe-detail-page">
      {/* 1. HERO BANNER SECTION */}
      <section className="recipe-hero-section">
        <div className="container">
          <div className="recipe-hero-grid">
            <div className="recipe-hero-image-wrapper">
              <img 
                src={(Array.isArray(recipe.imageUrl) ? recipe.imageUrl[0] : recipe.imageUrl) || 'https://picsum.photos/seed/recipe1/800/600'} 
                alt={recipe.name} 
                className="recipe-hero-image"
              />
              <span className="cuisine-flag-chip">
                {getCuisineFlag(recipe.cuisine)} {recipe.cuisine}
              </span>
            </div>

            <div className="recipe-hero-content">
              <div className="recipe-meta-badges">
                <Badge variant="primary">{recipe.category || 'Main'}</Badge>
                {recipe.source && <Badge variant="neutral">Source: {recipe.source}</Badge>}
              </div>

              <h1 className="recipe-title">{recipe.name}</h1>
              <p className="recipe-tagline">"A classic you can actually finish on a weeknight."</p>

              <div className="recipe-stats-row">
                <div className="recipe-stat-item">
                  <span className="stat-star">★</span>
                  <span className="stat-score">{recipe.averageRating ? Number(recipe.averageRating).toFixed(1) : '5.0'}</span>
                  <span className="stat-count">({ratings.length} {ratings.length === 1 ? 'review' : 'reviews'})</span>
                </div>

                <div className="recipe-stat-item">
                  <span className="stat-icon">👤</span>
                  <span className="stat-author">By {recipe.submittedBy || 'TheMealDB'}</span>
                </div>
              </div>

              <div className="recipe-quick-info">
                <div className="quick-info-box">
                  <span className="quick-label">Prep & Cook</span>
                  <span className="quick-val">30-45 Mins</span>
                </div>
                <div className="quick-info-box">
                  <span className="quick-label">Yield</span>
                  <span className="quick-val">4 Servings</span>
                </div>
                <div className="quick-info-box">
                  <span className="quick-label">Difficulty</span>
                  <span className="quick-val">Easy / Mid</span>
                </div>
              </div>

              <div className="hero-actions-inline">
                <a href="#ingredients-section" className="btn-primary">
                  Jump to Ingredients
                </a>
                <a href="#instructions-section" className="btn-secondary">
                  Start Cooking
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HAND-DRAWN WAVY SEPARATOR */}
      <div className="section-divider-wavy">
        <svg viewBox="0 0 1200 24" preserveAspectRatio="none">
          <path d="M0,0 C150,18 350,-8 500,12 C650,32 900,-5 1200,10 L1200,24 L0,24 Z" fill="#FFFFFF"></path>
        </svg>
      </div>

      {/* 2. MAIN COOKING SECTION (INGREDIENTS SIDEBAR + INSTRUCTIONS) */}
      <section className="section recipe-main-body" id="ingredients-section">
        <div className="container">
          <div className="recipe-layout-grid">
            
            {/* INGREDIENTS CHECKLIST SIDEBAR */}
            <aside className="ingredients-sidebar">
              <div className="ingredients-card">
                <div className="ingredients-header">
                  <span className="eyebrow">Pantry Check</span>
                  <h2>What you'll need</h2>
                  <p className="meta-text">{ingredientsList.length} items required • Check off as you prep</p>
                </div>

                <ul className="ingredients-list">
                  {ingredientsList.map((item, index) => {
                    const isChecked = !!checkedIngredients[index];
                    return (
                      <li key={index} className={`ingredient-item ${isChecked ? 'checked' : ''}`}>
                        <label className="checkbox-container">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => toggleIngredient(index)}
                          />
                          <span className="checkmark"></span>
                          <span className="ingredient-text">{item}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>

                <div className="pantry-tip-box">
                  <span className="tip-icon">💡</span>
                  <p className="tip-text">Pro Tip: Measure everything out before turning on the heat. Global flavors move fast once the wok or pan is hot!</p>
                </div>
              </div>
            </aside>

            {/* INSTRUCTIONS CONTENT AREA */}
            <main className="instructions-content" id="instructions-section">
              <div className="instructions-header">
                <span className="eyebrow">Step-by-step</span>
                <h2>How it comes together</h2>
                <p className="subtitle-desc">Follow these clear steps to achieve restaurant-grade results in your own kitchen.</p>
              </div>

              <div className="instructions-steps-list">
                {instructionsList.map((step, idx) => (
                  <div key={idx} className="step-card">
                    <div className="step-number-badge">
                      <span>{idx + 1}</span>
                    </div>
                    <div className="step-text-wrapper">
                      <h3>Step {idx + 1}</h3>
                      <p>{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </main>

          </div>
        </div>
      </section>

      {/* 3. VIDEO WALKTHROUGH SECTION */}
      {embedUrl && (
        <section className="section video-section">
          <div className="container">
            <div className="section-head text-center">
              <span className="eyebrow">Visual Guide</span>
              <h2>Watch it <span className="italic-accent">made</span></h2>
              <p className="hero-subtitle">Sometimes a photo isn't enough — here's the dish in full motion.</p>
            </div>

            <div className="video-player-wrapper">
              <div className="video-embed">
                <iframe 
                  src={embedUrl} 
                  title={`${recipe.name} Recipe Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. RATINGS & REVIEWS SECTION */}
      <section className="section reviews-section">
        <div className="container">
          <div className="reviews-grid">
            
            {/* SUBMIT RATING FORM */}
            <div className="review-form-column">
              <div className="form-card">
                <span className="eyebrow">Community Feedback</span>
                <h2>Cooked it? Tell us how it went.</h2>
                <p className="form-subtext">Share your tweaks, substitutions, or star rating to help other home cooks.</p>

                {ratingSuccess && (
                  <Alert variant="success" title="Review Posted!">
                    ✓ Thank you! Your rating and feedback have been added to the recipe map.
                  </Alert>
                )}

                {ratingError && (
                  <Alert variant="error" title="Submission Error">
                    {ratingError}
                  </Alert>
                )}

                {!ratingSuccess && (
                  <form onSubmit={handleRatingSubmit} className="rating-form">
                    <div className="star-picker-wrapper">
                      <label className="picker-label">Your Rating</label>
                      <div className="interactive-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            className={`star-btn ${(hoverRating || ratingValue) >= star ? 'filled' : ''}`}
                            onClick={() => setRatingValue(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <Input
                      label="Your Name (Optional)"
                      placeholder="e.g. Chef Maria"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                    />

                    <Textarea
                      label="Your Comment or Kitchen Notes"
                      placeholder="How did it turn out? Did you add extra spices or substitute anything?"
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />

                    <Button 
                      variant="primary" 
                      type="submit" 
                      loading={submittingRating}
                      fullWidth
                    >
                      Submit Your Rating
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* LIST OF EXISTING REVIEWS */}
            <div className="reviews-list-column">
              <div className="reviews-list-header">
                <h3>Cook Feedback ({ratings.length})</h3>
                <span className="badge badge-primary">★ {recipe.averageRating ? Number(recipe.averageRating).toFixed(1) : '5.0'} / 5</span>
              </div>

              {ratings.length === 0 ? (
                <div className="empty-reviews-box">
                  <p className="empty-title">No reviews yet</p>
                  <p className="empty-desc">Be the first to put this recipe to the test and leave your stamp!</p>
                </div>
              ) : (
                <div className="comments-stream">
                  {ratings.map((rev, i) => (
                    <div key={rev._id || i} className="comment-card">
                      <div className="comment-head">
                        <div className="author-info">
                          <div className="comment-avatar">
                            {(rev.authorName || 'A')[0].toUpperCase()}
                          </div>
                          <div>
                            <strong className="author-name">{rev.authorName || 'Anonymous Cook'}</strong>
                            <span className="comment-date">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recently cooked'}
                            </span>
                          </div>
                        </div>
                        <div className="comment-stars">
                          {'★'.repeat(rev.stars || 5)}
                          {'☆'.repeat(5 - (rev.stars || 5))}
                        </div>
                      </div>
                      <p className="comment-body">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 5. YOU MIGHT ALSO LIKE (RELATED RECIPES) */}
      {relatedRecipes.length > 0 && (
        <section className="section related-section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">More {recipe.cuisine} Flavors</span>
              <h2>You might also like</h2>
            </div>

            <div className="grid grid-4">
              {relatedRecipes.map((rel) => (
                <Link to={`/recipe/${rel._id || rel.id}`} key={rel._id || rel.id} className="recipe-card-link">
                  <div className="card recipe-card">
                    <div className="card-image-wrapper">
                      <img 
                        src={(Array.isArray(rel.imageUrl) ? rel.imageUrl[0] : rel.imageUrl) || 'https://picsum.photos/seed/food/600/400'} 
                        alt={rel.name}
                        className="card-image"
                      />
                      <span className="cuisine-chip">
                        {getCuisineFlag(rel.cuisine)} {rel.cuisine}
                      </span>
                    </div>
                    <div className="card-body">
                      <span className="meta-category">{rel.category || 'Main'}</span>
                      <h3 className="card-title">{rel.name}</h3>
                      <div className="card-footer-meta">
                        <span className="card-rating">★ {rel.averageRating ? Number(rel.averageRating).toFixed(1) : '5.0'}</span>
                        <span className="card-action-text">View Recipe →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}