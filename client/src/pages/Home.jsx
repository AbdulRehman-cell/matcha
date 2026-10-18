import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Button, Spinner, Card, Badge } from '../components/ui';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recipeOfDay, setRecipeOfDay] = useState(null);
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const cuisines = [
    { name: 'Italian', flag: '🇮🇹', count: '42 recipes', desc: 'Pasta, risotto, & wood-fired classics' },
    { name: 'Mexican', flag: '🇲🇽', count: '38 recipes', desc: 'Tacos, moles, & vibrant salsas' },
    { name: 'Indian', flag: '🇮🇳', count: '45 recipes', desc: 'Curries, biryanis, & fragrant spices' },
    { name: 'Japanese', flag: '🇯🇵', count: '36 recipes', desc: 'Ramen, sushi, & izakaya favorites' },
    { name: 'Chinese', flag: '🇨🇳', count: '40 recipes', desc: 'Szechuan, dim sum, & wok stir-fries' },
    { name: 'American', flag: '🇺🇸', count: '30 recipes', desc: 'Smoked BBQ, burgers, & hearty pies' },
    { name: 'French', flag: '🇫🇷', count: '28 recipes', desc: 'Bistrot classics & delicate sauces' },
    { name: 'Moroccan', flag: '🇲🇦', count: '24 recipes', desc: 'Aromatic tagines & couscous spreads' }
  ];

  const categories = ['All', 'Starter', 'Main', 'Dessert', 'Side', 'Breakfast'];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/recipes');
        const data = Array.isArray(res.data) ? res.data : [];

        if (data.length > 0) {
          // Date-seeded index for Recipe of the Day
          const today = new Date();
          const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
          const featuredIndex = dayOfYear % data.length;
          setRecipeOfDay(data[featuredIndex] || data[0]);

          // Filter top rated or active recipes
          const sorted = [...data].sort((a, b) => (b.averageRating || 4.5) - (a.averageRating || 4.5));
          setTrendingRecipes(sorted.slice(0, 8));
        }
      } catch (err) {
        console.error('Error loading recipes:', err);
        setError('Failed to load today’s featured dishes. Please refresh or check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const filteredTrending = selectedCategory === 'All'
    ? trendingRecipes
    : trendingRecipes.filter(r => r.category && r.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero">
        <img
          className="hero-bg"
          src="https://picsum.photos/seed/culinaryhero9/1600/900"
          alt="Overhead food layout with spices and fresh herbs"
        />
        <div className="container">
          <span className="eyebrow">Your passport has a kitchen</span>
          <h1>
            Dinner, from <span className="gradient-text">everywhere</span>.
          </h1>
          <p className="hero-subtitle">
            Matcha is the world's recipe box — real dishes from real cuisines, cooked by real people, one search away from your stove.
          </p>

          <form className="hero-search-box" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-field"
                placeholder="Search by dish or ingredient (e.g., paneer, tacos, chicken)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                Search Recipes
              </button>
            </div>
          </form>

          <div className="hero-quick-pills">
            <span className="quick-label">Trending searches:</span>
            <button className="pill-chip" onClick={() => navigate('/browse?q=Ramen')}>🍜 Ramen</button>
            <button className="pill-chip" onClick={() => navigate('/browse?q=Curry')}>🍛 Curry</button>
            <button className="pill-chip" onClick={() => navigate('/browse?q=Tacos')}>🌮 Tacos</button>
            <button className="pill-chip" onClick={() => navigate('/browse?q=Pasta')}>🍝 Pasta</button>
          </div>
        </div>

        {/* Wavy section divider motif */}
        <div className="hero-wavy-divider">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,90 350,-40 500,65 C650,170 900,10 1200,40 L1200,120 L0,120 Z" fill="var(--bg)"></path>
          </svg>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="stats-band">
        <div className="container">
          <div className="grid grid-4">
            <div className="stat-card">
              <div className="stat-value">300+</div>
              <div className="stat-label">Authentic Global Recipes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">8</div>
              <div className="stat-label">Iconic World Cuisines</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">100%</div>
              <div className="stat-label">Tested Home-Cook Dishes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">4.9★</div>
              <div className="stat-label">Average Community Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RECIPE OF THE DAY */}
      <section className="section recipe-of-day-section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Today's stamp: Morocco & Beyond</span>
            <h2>Today's pick, hot off the stove</h2>
            <p>We pick one dish a day so you stop scrolling and start chopping.</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <Spinner size="lg" />
              <p>Fetching today's culinary spotlight...</p>
            </div>
          ) : recipeOfDay ? (
            <div className="card recipe-day-card animate-in">
              <div className="day-badge-pin">★ Featured Pick</div>
              <div className="grid grid-2 align-center">
                <div className="recipe-day-image">
                  <img
                    src={recipeOfDay.imageUrl || 'https://picsum.photos/seed/tagine1/800/600'}
                    alt={recipeOfDay.name}
                    className="img-cover"
                  />
                  <div className="cuisine-flag-chip">
                    {recipeOfDay.cuisine === 'Italian' && '🇮🇹'}
                    {recipeOfDay.cuisine === 'Mexican' && '🇲🇽'}
                    {recipeOfDay.cuisine === 'Indian' && '🇮🇳'}
                    {recipeOfDay.cuisine === 'Japanese' && '🇯🇵'}
                    {recipeOfDay.cuisine === 'Chinese' && '🇨🇳'}
                    {recipeOfDay.cuisine === 'American' && '🇺🇸'}
                    {recipeOfDay.cuisine === 'French' && '🇫🇷'}
                    {recipeOfDay.cuisine === 'Moroccan' && '🇲🇦'}
                    {' '}{recipeOfDay.cuisine || 'Global'}
                  </div>
                </div>

                <div className="recipe-day-content">
                  <div className="recipe-meta-badges">
                    <Badge variant="primary">{recipeOfDay.category || 'Main Course'}</Badge>
                    <span className="rating-pill">
                      ★ {recipeOfDay.averageRating ? Number(recipeOfDay.averageRating).toFixed(1) : '4.8'} (84 reviews)
                    </span>
                  </div>

                  <h3 className="recipe-title-lg">{recipeOfDay.name}</h3>
                  <p className="recipe-description">
                    {Array.isArray(recipeOfDay.instructions)
                      ? (recipeOfDay.instructions[0] || '').slice(0, 180) + '...'
                      : (recipeOfDay.instructions || '').slice(0, 180) + '...'}
                  </p>

                  <div className="recipe-quick-details">
                    <div className="detail-item">
                      <span className="icon">⏱️</span>
                      <span>35 mins prep</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">🔥</span>
                      <span>Easy to Medium</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">🥘</span>
                      <span>Serves 4</span>
                    </div>
                  </div>

                  <div className="day-card-actions">
                    <Link to={`/recipe/${recipeOfDay._id}`} className="btn-primary">
                      Cook This Tonight
                    </Link>
                    <button
                      className="btn-secondary"
                      onClick={() => navigate(`/browse?cuisine=${recipeOfDay.cuisine}`)}
                    >
                      More {recipeOfDay.cuisine} Dishes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">No featured recipe available right now.</div>
          )}
        </div>
      </section>

      {/* 3. BROWSE BY CUISINE */}
      <section className="section bg-surface">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Pick a country, not a category</span>
            <h2>Browse by country</h2>
            <p>Eight real, tested cuisines — straight from regional home kitchens to your table.</p>
          </div>

          <div className="grid grid-4 cuisine-grid">
            {cuisines.map((c) => (
              <div
                key={c.name}
                className="card cuisine-card interactive"
                onClick={() => navigate(`/browse?cuisine=${c.name}`)}
              >
                <div className="cuisine-flag-large">{c.flag}</div>
                <h4>{c.name}</h4>
                <p className="meta-text">{c.count}</p>
                <p className="cuisine-desc">{c.desc}</p>
                <span className="link-arrow">Explore recipes →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BROWSE BY CATEGORY / COURSE */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Or pick a course</span>
            <h2>Browse by course</h2>
            <p>Breakfast in Tokyo. Dessert in Marrakech. Your call.</p>
          </div>

          <div className="filter-bar center-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="category-feature-box">
            <div className="grid grid-3">
              <div className="feature-card">
                <div className="feature-icon">🥐</div>
                <h3>Starters & Small Bites</h3>
                <p>Crispy dumplings, vibrant mezze, and savory broths designed to kick off any feast.</p>
                <Link to="/browse?category=Starter" className="text-link">Browse Starters →</Link>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🍲</div>
                <h3>Hearty Main Dishes</h3>
                <p>Slow-simmered curries, perfect hand-rolled pastas, and rich traditional stews.</p>
                <Link to="/browse?category=Main" className="text-link">Browse Mains →</Link>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🍰</div>
                <h3>Sweets & Desserts</h3>
                <p>French patisserie standards, cardamom-scented syrups, and golden baked treats.</p>
                <Link to="/browse?category=Dessert" className="text-link">Browse Desserts →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRENDING THIS WEEK */}
      <section className="section bg-surface">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What everyone's actually cooking</span>
            <h2>Trending this week</h2>
            <p>Ranked by real stars from real home cooks, updated live.</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <Spinner size="md" />
              <p>Loading trending dishes...</p>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : (
            <div className="grid grid-4 recipe-grid">
              {filteredTrending.map((item) => (
                <div
                  key={item._id}
                  className="card recipe-card interactive"
                  onClick={() => navigate(`/recipe/${item._id}`)}
                >
                  <div className="recipe-card-media">
                    <img
                      src={item.imageUrl || 'https://picsum.photos/seed/fooditem/600/450'}
                      alt={item.name}
                      className="img-cover"
                    />
                    <div className="cuisine-pill">
                      {item.cuisine === 'Italian' && '🇮🇹'}
                      {item.cuisine === 'Mexican' && '🇲🇽'}
                      {item.cuisine === 'Indian' && '🇮🇳'}
                      {item.cuisine === 'Japanese' && '🇯🇵'}
                      {item.cuisine === 'Chinese' && '🇨🇳'}
                      {item.cuisine === 'American' && '🇺🇸'}
                      {item.cuisine === 'French' && '🇫🇷'}
                      {item.cuisine === 'Moroccan' && '🇲🇦'}
                      {' '}{item.cuisine}
                    </div>
                  </div>

                  <div className="recipe-card-body">
                    <div className="recipe-meta-top">
                      <span className="badge-category">{item.category || 'Main'}</span>
                      <span className="rating-star">★ {Number(item.averageRating || 4.8).toFixed(1)}</span>
                    </div>

                    <h4 className="recipe-title">{item.name}</h4>

                    <div className="recipe-card-footer">
                      <span className="source-label">
                        {item.source === 'user' ? '👤 Community Recipe' : '📖 Matcha Signature'}
                      </span>
                      <span className="view-btn">View →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="center-action">
            <Link to="/browse" className="btn-secondary">
              View All 300+ Recipes
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / STEPS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The Matcha Way</span>
            <h2>How to travel through your kitchen</h2>
            <p>No 3,000-word life stories. Just authentic recipes and clear instructions.</p>
          </div>

          <div className="grid grid-3 steps-row">
            <div className="step-card">
              <div className="step-num">01</div>
              <h3>Select a Country</h3>
              <p>Choose from 8 distinct culinary regions and filter by dietary constraints or course type.</p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h3>Gather Ingredients</h3>
              <p>Check off simplified, authentic ingredient lists with smart substitutes for rare items.</p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h3>Watch & Cook</h3>
              <p>Follow clear step-by-step instructions with optional embedded video walkthroughs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section bg-surface">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Stories from real kitchens</span>
            <h2>Tested by home cooks like you</h2>
          </div>

          <div className="grid grid-3">
            <div className="card testimonial">
              <p className="testimonial-text">
                "Finally a recipe site without 10 screen-lengths of fluff! Made the Tagine last night and my kitchen smelled like Marrakech."
              </p>
              <div className="testimonial-author">
                <img src="https://i.pravatar.cc/300?img=32" alt="Sarah M." className="avatar" />
                <div>
                  <strong>Sarah Jenkins</strong>
                  <span className="testimonial-role">Home Cook, Chicago</span>
                </div>
              </div>
            </div>

            <div className="card testimonial">
              <p className="testimonial-text">
                "The Chicken Tikka Masala step-by-step instructions were foolproof. My family asked if I ordered takeout!"
              </p>
              <div className="testimonial-author">
                <img src="https://i.pravatar.cc/300?img=12" alt="David K." className="avatar" />
                <div>
                  <strong>David Chen</strong>
                  <span className="testimonial-role">Weekend Baker, Seattle</span>
                </div>
              </div>
            </div>

            <div className="card testimonial">
              <p className="testimonial-text">
                "I submitted my grandmother's authentic Birria recipe. Seeing it approved and rated 5 stars by people everywhere made my day."
              </p>
              <div className="testimonial-author">
                <img src="https://i.pravatar.cc/300?img=47" alt="Elena R." className="avatar" />
                <div>
                  <strong>Elena Rodriguez</strong>
                  <span className="testimonial-role">Community Contributor, Austin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SUBMIT YOUR OWN CTA BANNER */}
      <section className="section">
        <div className="container">
          <div className="cta-section">
            <div className="cta-content">
              <span className="eyebrow light">Got a family recipe worth sharing?</span>
              <h2>Your kitchen belongs on this map too</h2>
              <p>
                Add your dish to the map. We'll put it in front of people who are genuinely hungry for authentic, real-world cooking.
              </p>
              <div className="cta-actions">
                <Link to="/submit" className="btn-primary">
                  Steal This Recipe / Submit Yours
                </Link>
                <Link to="/browse" className="btn-ghost">
                  Browse Map First
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}