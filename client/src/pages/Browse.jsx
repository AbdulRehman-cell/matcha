import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Select, Badge, Spinner, Alert, EmptyState } from '../components/ui';

const CUISINES = [
  { label: 'All Cuisines', value: '' },
  { label: '🇮🇹 Italian', value: 'Italian' },
  { label: '🇲🇽 Mexican', value: 'Mexican' },
  { label: '🇮🇳 Indian', value: 'Indian' },
  { label: '🇯🇵 Japanese', value: 'Japanese' },
  { label: '🇨🇳 Chinese', value: 'Chinese' },
  { label: '🇺🇸 American', value: 'American' },
  { label: '🇫🇷 French', value: 'French' },
  { label: '🇲🇦 Moroccan', value: 'Moroccan' }
];

const CATEGORIES = [
  { label: 'All Courses', value: '' },
  { label: '🥗 Starter', value: 'Starter' },
  { label: '🥘 Main', value: 'Main' },
  { label: '🍰 Dessert', value: 'Dessert' },
  { label: '🥖 Side', value: 'Side' },
  { label: '🍳 Breakfast', value: 'Breakfast' }
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Alphabetical (A-Z)', value: 'alphabetical' }
];

export default function Browse() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state sync
  const queryParam = searchParams.get('q') || '';
  const cuisineParam = searchParams.get('cuisine') || '';
  const categoryParam = searchParams.get('category') || '';

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [selectedCuisine, setSelectedCuisine] = useState(cuisineParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('newest');

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);

  // Sync state if URL changes externally
  useEffect(() => {
    setSearchTerm(queryParam);
    setSelectedCuisine(cuisineParam);
    setSelectedCategory(categoryParam);
  }, [queryParam, cuisineParam, categoryParam]);

  // Fetch recipes
  useEffect(() => {
    fetchRecipes();
  }, [cuisineParam, categoryParam]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = '/api/recipes';
      const params = new URLSearchParams();
      if (cuisineParam) params.append('cuisine', cuisineParam);
      if (categoryParam) params.append('category', categoryParam);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await axios.get(url);
      setRecipes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load recipes:', err);
      setError(err.response?.data?.error || 'Failed to fetch recipes. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newCuisine, newCategory, newSearch) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('q', newSearch);
    if (newCuisine) params.set('cuisine', newCuisine);
    if (newCategory) params.set('category', newCategory);
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters(selectedCuisine, selectedCategory, searchTerm);
  };

  const handleCuisineSelect = (val) => {
    setSelectedCuisine(val);
    updateFilters(val, selectedCategory, searchTerm);
  };

  const handleCategorySelect = (val) => {
    setSelectedCategory(val);
    updateFilters(selectedCuisine, val, searchTerm);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCuisine('');
    setSelectedCategory('');
    setSearchParams({});
  };

  // Client-side filtering for live search and sorting
  const filteredRecipes = recipes.filter(recipe => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const nameMatch = recipe.name?.toLowerCase().includes(q);
    const ingMatch = Array.isArray(recipe.ingredients) 
      ? recipe.ingredients.some(i => String(i).toLowerCase().includes(q))
      : String(recipe.ingredients || '').toLowerCase().includes(q);
    return nameMatch || ingMatch;
  });

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.averageRating || 0) - (a.averageRating || 0);
    }
    if (sortBy === 'alphabetical') {
      return (a.name || '').localeCompare(b.name || '');
    }
    // Default: newest
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const displayedRecipes = sortedRecipes.slice(0, visibleCount);
  const hasMore = visibleCount < sortedRecipes.length;

  const getCuisineFlag = (cuisineName) => {
    const found = CUISINES.find(c => c.value.toLowerCase() === (cuisineName || '').toLowerCase());
    return found ? found.label.split(' ')[0] : '🌐';
  };

  return (
    <div className="browse-page">
      {/* Compact Header Hero */}
      <section className="hero page-hero-compact">
        <div className="container">
          <span className="eyebrow">GLOBAL DISCOVERY</span>
          <h1>All the <span className="gradient-text">recipes</span>, none of the guesswork.</h1>
          <p className="hero-subtitle">
            Search 300+ tested recipes from kitchens around the globe. Filter by country, course, or ingredient.
          </p>
        </div>
      </section>

      {/* Main Filter & Search Section */}
      <section className="section search-filter-section">
        <div className="container">
          <div className="search-bar-wrapper card">
            <form onSubmit={handleSearchSubmit} className="search-form-grid">
              <div className="search-input-col">
                <Input
                  placeholder="Search by dish name or ingredient ('paneer', 'tacos', 'pasta')..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  iconLeft={<span style={{ fontSize: '1.2rem' }}>🔍</span>}
                />
              </div>
              <div className="search-btn-col">
                <Button type="submit" variant="primary" fullWidth>
                  Search Recipes
                </Button>
              </div>
            </form>

            <div className="filters-row">
              <div className="filter-item">
                <label className="filter-label">Cuisine</label>
                <Select
                  options={CUISINES}
                  value={selectedCuisine}
                  onChange={(e) => handleCuisineSelect(e.target.value)}
                />
              </div>

              <div className="filter-item">
                <label className="filter-label">Course / Category</label>
                <Select
                  options={CATEGORIES}
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                />
              </div>

              <div className="filter-item">
                <label className="filter-label">Sort By</label>
                <Select
                  options={SORT_OPTIONS}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>
            </div>

            {/* Active Filters Bar */}
            {(selectedCuisine || selectedCategory || searchTerm) && (
              <div className="active-filters-strip">
                <span className="active-filters-label">Active filters:</span>
                {selectedCuisine && (
                  <Badge variant="primary" size="md">
                    Cuisine: {selectedCuisine}
                    <button 
                      type="button"
                      className="filter-remove-btn" 
                      onClick={() => handleCuisineSelect('')}
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="neutral" size="md">
                    Course: {selectedCategory}
                    <button 
                      type="button"
                      className="filter-remove-btn" 
                      onClick={() => handleCategorySelect('')}
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="neutral" size="md">
                    Search: "{searchTerm}"
                    <button 
                      type="button"
                      className="filter-remove-btn" 
                      onClick={() => {
                        setSearchTerm('');
                        updateFilters(selectedCuisine, selectedCategory, '');
                      }}
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <button 
                  type="button" 
                  className="btn-ghost-sm" 
                  onClick={clearAllFilters}
                  style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '0.875rem' }}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recipe Grid & Results */}
      <section className="section recipe-grid-section">
        <div className="container">
          {error && (
            <Alert variant="error" title="Unable to load recipes">
              {error}
            </Alert>
          )}

          {loading ? (
            <div className="loading-container" style={{ padding: '64px 0', textCenter: 'center' }}>
              <Spinner size="lg" color="primary" />
              <p style={{ marginTop: '16px', color: 'var(--muted)' }}>Fetching recipes from the world kitchen...</p>
            </div>
          ) : sortedRecipes.length === 0 ? (
            <EmptyState
              icon="🍳"
              title="We came up empty-handed"
              description="Nothing matches that search combination. Try searching for 'chicken', or browse by country instead."
              action={
                <Button variant="secondary" onClick={clearAllFilters}>
                  Clear Filters & Show All
                </Button>
              }
            />
          ) : (
            <>
              <div className="results-header-meta">
                <p className="meta-text">
                  Showing <strong>{displayedRecipes.length}</strong> of <strong>{sortedRecipes.length}</strong> matching dishes
                </p>
              </div>

              <div className="grid grid-3 recipe-cards-grid">
                {displayedRecipes.map((recipe) => (
                  <div
                    key={recipe._id}
                    className="card recipe-card animate-in"
                    onClick={() => navigate(`/recipe/${recipe._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="recipe-card-media">
                      <img
                        src={recipe.imageUrl || 'https://picsum.photos/seed/recipefallback/600/400'}
                        alt={recipe.name}
                        className="recipe-card-img"
                        loading="lazy"
                      />
                      <div className="recipe-cuisine-chip">
                        <span>{getCuisineFlag(recipe.cuisine)}</span>
                        <span className="chip-text">{recipe.cuisine}</span>
                      </div>
                    </div>

                    <div className="recipe-card-body">
                      <div className="recipe-card-meta">
                        <Badge variant="neutral" size="sm">{recipe.category || 'Main'}</Badge>
                        <div className="recipe-rating">
                          <span className="star-icon">★</span>
                          <span className="rating-num">
                            {recipe.averageRating ? recipe.averageRating.toFixed(1) : '4.8'}
                          </span>
                        </div>
                      </div>

                      <h3 className="recipe-card-title">{recipe.name}</h3>

                      <p className="recipe-card-excerpt">
                        {Array.isArray(recipe.ingredients) 
                          ? `${recipe.ingredients.length} ingredients • ${recipe.instructions?.[0]?.slice(0, 75) || 'Authentic regional classic'}...`
                          : 'Delicious home-cooked dish tested by the Matcha community.'}
                      </p>

                      <div className="recipe-card-footer">
                        <span className="author-tag">
                          {recipe.source === 'user' ? `Submitted by ${recipe.submittedBy || 'Cook'}` : 'Verified Recipe'}
                        </span>
                        <span className="action-link">Cook this →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="pagination-wrapper" style={{ marginTop: '48px', textAlign: 'center' }}>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                  >
                    Load More Recipes
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Quick Category Quick-Select Bar */}
      <section className="section category-quick-bar" style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-head" style={{ marginBottom: '24px' }}>
            <span className="eyebrow">FAST NAVIGATION</span>
            <h2>Popular Cuisines at a Glance</h2>
          </div>

          <div className="filter-bar cuisine-pills-row">
            {CUISINES.filter(c => c.value !== '').map((c) => (
              <button
                key={c.value}
                type="button"
                className={`btn-pill ${selectedCuisine === c.value ? 'active' : ''}`}
                onClick={() => handleCuisineSelect(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}