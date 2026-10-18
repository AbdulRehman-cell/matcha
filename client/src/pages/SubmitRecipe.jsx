import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Textarea, Select, Card, Badge, Alert, Spinner } from '../components/ui';

export default function SubmitRecipe() {
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('Italian');
  const [category, setCategory] = useState('Main');
  const [imageUrl, setImageUrl] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  // Dynamic Lists for Ingredients and Instructions
  const [ingredients, setIngredients] = useState(['', '', '']);
  const [instructions, setInstructions] = useState(['', '']);

  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const cuisineOptions = [
    { value: 'Italian', label: '🇮🇹 Italian' },
    { value: 'Mexican', label: '🇲🇽 Mexican' },
    { value: 'Indian', label: '🇮🇳 Indian' },
    { value: 'Japanese', label: '🇯🇵 Japanese' },
    { value: 'Chinese', label: '🇨🇳 Chinese' },
    { value: 'American', label: '🇺🇸 American' },
    { value: 'French', label: '🇫🇷 French' },
    { value: 'Moroccan', label: '🇲🇦 Moroccan' }
  ];

  const categoryOptions = [
    { value: 'Starter', label: '🥣 Starter' },
    { value: 'Main', label: '🍲 Main Course' },
    { value: 'Dessert', label: '🍰 Dessert' },
    { value: 'Side', label: '🥗 Side Dish' },
    { value: 'Breakfast', label: '🍳 Breakfast' }
  ];

  // Helper functions for dynamic ingredients
  const handleIngredientChange = (index, value) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredientField = (index) => {
    if (ingredients.length <= 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Helper functions for dynamic instructions const handleInstructionChange = (index, value) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addInstructionStep = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstructionStep = (index) => {
    if (instructions.length <= 1) return;
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) {
      setError('Please provide a recipe name.');
      return;
    }

    const cleanIngredients = ingredients.map(i => i.trim()).filter(Boolean);
    if (cleanIngredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    const cleanInstructions = instructions.map(i => i.trim()).filter(Boolean);
    if (cleanInstructions.length === 0) {
      setError('Please add at least one instruction step.');
      return;
    }

    const fallbackImage = 'https://picsum.photos/seed/recipefallback/800/600';

    const payload = {
      name: name.trim(),
      cuisine,
      category,
      imageUrl: imageUrl.trim() || fallbackImage,
      ingredients: cleanIngredients,
      instructions: cleanInstructions,
      youtubeUrl: youtubeUrl.trim(),
      submittedBy: submittedBy.trim() || 'Anonymous Home Cook',
      source: 'user',
      status: 'pending' // pending moderation approval
    };

    try {
      setLoading(true);
      await axios.post('/api/recipes', payload);
      setLoading(false);
      setSuccess(true);
      // Reset fields
      setName('');
      setImageUrl('');
      setSubmittedBy('');
      setYoutubeUrl('');
      setIngredients(['', '', '']);
      setInstructions(['', '']);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to submit recipe. Please try again.');
    }
  };

  const defaultPreviewImage = imageUrl.trim() || 'https://picsum.photos/seed/kitchenprep/800/600';

  return (
    <div className="submit-recipe-page animate-in">
      {/* Page Header Hero */}
      <section className="hero page-hero-sm">
        <div className="container">
          <span className="eyebrow">Community Kitchen</span>
          <h1>Add your <span className="gradient-text">recipe</span> to the map</h1>
          <p className="hero-subtitle">
            Fill in the details below. Our editorial team reviews every submission to ensure clear steps and delicious results — usually within 24 to 48 hours.
          </p>
        </div>
      </section>

      {/* Main Content Section: Submission Form + Live Preview Card */}
      <section className="section">
        <div className="container">
          {success ? (
            <div className="card card-elevated success-state-card text-center">
              <div className="success-icon-badge">✨</div>
              <h2>You're in the queue!</h2>
              <p className="hero-subtitle">
                Got it! Your recipe for <strong>{name || 'your dish'}</strong> has been submitted to the Matcha editorial team.
              </p>
              <div className="alert alert-success" style={{ margin: '24px auto', maxWidth: '600px' }}>
                We review submissions daily to verify ingredient quantities and clear step instructions. Once approved, it will be published live for cooks around the globe!
              </div>
              <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '32px' }}>
                <Button variant="primary" onClick={() => setSuccess(false)}>
                  Submit Another Recipe
                </Button>
                <Link to="/browse">
                  <Button variant="secondary">Browse All Recipes</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-2 form-preview-layout">
              {/* Left Column: Form */}
              <div className="form-column">
                <div className="section-head-sm">
                  <h2>The details</h2>
                  <p className="meta-text">Share your secret family staple or a recent culinary experiment.</p>
                </div>

                {error && (
                  <Alert variant="error" title="Submission Error" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="submit-form">
                  <div className="form-group">
                    <Input
                      label="Recipe Name *"
                      placeholder="e.g. Grandma's Tuscan Garlic Butter Tagliatelle"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-2">
                    <div className="form-group">
                      <Select
                        label="Cuisine *"
                        options={cuisineOptions}
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <Select
                        label="Course Category *"
                        options={categoryOptions}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-2">
                    <div className="form-group">
                      <Input
                        label="Your Name or Handle"
                        placeholder="e.g. Chef Marco or @cookwithkate"
                        value={submittedBy}
                        onChange={(e) => setSubmittedBy(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="Photo URL"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <Input
                      label="YouTube Video Link (Optional)"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                  </div>

                  {/* Dynamic Ingredients Section */}
                  <div className="dynamic-section">
                    <div className="dynamic-header">
                      <div>
                        <label className="input-label" style={{ fontWeight: 600, fontSize: '1rem' }}>Ingredients List *</label>
                        <p className="meta-text">One ingredient per row — include quantities (e.g., '2 cloves garlic, minced').</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={addIngredientField}>
                        + Add Line
                      </Button>
                    </div>

                    <div className="dynamic-rows">
                      {ingredients.map((ing, idx) => (
                        <div key={idx} className="dynamic-row">
                          <Input
                            placeholder={`Ingredient ${idx + 1} (e.g. 500g Fresh Pappardelle)`}
                            value={ing}
                            onChange={(e) => handleIngredientChange(idx, e.target.value)}
                          />
                          {ingredients.length > 1 && (
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removeIngredientField(idx)}
                              title="Remove ingredient"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Instructions Section */}
                  <div className="dynamic-section">
                    <div className="dynamic-header">
                      <div>
                        <label className="input-label" style={{ fontWeight: 600, fontSize: '1rem' }}>Step-by-Step Instructions *</label>
                        <p className="meta-text">Keep steps short, clear, and sequential.</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={addInstructionStep}>
                        + Add Step
                      </Button>
                    </div>

                    <div className="dynamic-rows">
                      {instructions.map((step, idx) => (
                        <div key={idx} className="dynamic-row step-row-input">
                          <span className="step-badge">{idx + 1}</span>
                          <Textarea
                            placeholder={`Step ${idx + 1} description...`}
                            value={step}
                            onChange={(e) => handleInstructionChange(idx, e.target.value)}
                            rows={2}
                          />
                          {instructions.length > 1 && (
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removeInstructionStep(idx)}
                              title="Remove step"
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-submit-row">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={loading}
                      disabled={loading}
                      fullWidth
                    >
                      {loading ? 'Submitting Recipe...' : 'Submit Recipe for Review'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Card Preview */}
              <div className="preview-column">
                <div className="sticky-preview">
                  <div className="section-head-sm">
                    <h2>Live card preview</h2>
                    <p className="meta-text">Here is how your recipe card will appear on the homepage and global feeds.</p>
                  </div>

                  <Card variant="bordered" className="preview-recipe-card">
                    <div className="card-image-wrap">
                      <img
                        src={defaultPreviewImage}
                        alt="Preview"
                        className="card-image"
                        onError={(e) => {
                          e.target.src = 'https://picsum.photos/seed/recipefallback/800/600';
                        }}
                      />
                      <div className="card-cuisine-flag">
                        <span>{cuisineOptions.find(c => c.value === cuisine)?.label || cuisine}</span>
                      </div>
                      <Badge variant="neutral" className="card-category-badge">
                        {category}
                      </Badge>
                    </div>

                    <div className="card-body">
                      <div className="card-rating-row">
                        <span className="stars-fill">★★★★★</span>
                        <span className="rating-count">(New Submission)</span>
                      </div>
                      <h3 className="card-title">
                        {name || 'Your Recipe Title Here'}
                      </h3>
                      <p className="card-author-meta">
                        Submitted by: <strong>{submittedBy || 'Anonymous Home Cook'}</strong>
                      </p>

                      <div className="preview-counts-row">
                        <span className="preview-pill">
                          📋 {ingredients.filter(i => i.trim()).length} Ingredients
                        </span>
                        <span className="preview-pill">
                          👨‍🍳 {instructions.filter(i => i.trim()).length} Steps
                        </span>
                      </div>
                    </div>
                  </Card>

                  <div className="preview-note-box">
                    <p>💡 <strong>Editorial Guidelines:</strong></p>
                    <ul className="guidelines-list">
                      <li>Use standard measurement units (grams, cups, tbsp).</li>
                      <li>Highlight key cooking temperature and cooking time tips.</li>
                      <li>Photos must be crisp, well-lit overhead or 45°-angle dish shots.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Community Guidelines Section */}
      <section className="section bg-surface">
        <div className="container">
          <div className="section-head text-center">
            <span className="eyebrow">Community Standards</span>
            <h2>What makes a great Matcha recipe?</h2>
            <p className="hero-subtitle">
              We aim for authentic home cooking — real meals tasted and perfected in real kitchens.
            </p>
          </div>

          <div className="grid grid-3">
            <div className="feature-card">
              <div className="feature-icon">🌶️</div>
              <h3>Authentic & Tested</h3>
              <p>
                Whether it's a regional tradition passed down or a modern weekly staple, make sure the proportions are well-tested so fellow cooks achieve success on their first attempt.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3>Clear Food Media</h3>
              <p>
                Provide high-resolution photos that showcase the vibrant colors and plating details of your dish. Overhead natural light flat-lays always work best!
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Friendly Guidance</h3>
              <p>
                Include helpful kitchen hacks in your steps — like how to tell when dough is properly kneaded or how to tone down chili heat without losing spice flavor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Submission FAQ Section */}
      <section className="section">
        <div className="container container-narrow">
          <div className="section-head text-center">
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-list">
            <div className="card card-white faq-item">
              <h4>How long does review take?</h4>
              <p>Our kitchen moderators verify submissions within 24–48 hours. Once approved, your recipe immediately receives a passport stamp in our global index!</p>
            </div>
            <div className="card card-white faq-item">
              <h4>Can I edit my recipe after submitting?</h4>
              <p>Yes! If you need to tweak ingredient ratios or step descriptions after posting, drop us a note or contact our community admins in the moderation desk.</p>
            </div>
            <div className="card card-white faq-item">
              <h4>Can I link my social cooking channel?</h4>
              <p>Absolutely! Include your YouTube walkthrough link in the submission form so cooks can follow your video guides directly from the recipe page.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}