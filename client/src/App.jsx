import React from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';

// Import pages
import Home from './pages/Home';
import Browse from './pages/Browse';
import RecipeDetail from './pages/RecipeDetail';
import SubmitRecipe from './pages/SubmitRecipe';
import Admin from './pages/Admin';

export default function App() {
  return (
    <div className="app-layout">
      {/* Sticky frosted header navigation */}
      <header className="header sticky-header">
        <div className="container nav-container">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">🍵</span>
            <span className="logo-text">matcha</span>
          </Link>

          <nav className="nav-links">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
              Home
            </NavLink>
            <NavLink to="/browse" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Browse Recipes
            </NavLink>
            <NavLink to="/submit" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Submit Recipe
            </NavLink>
          </nav>

          <div className="nav-actions">
            <Link to="/browse" className="btn-primary btn-sm">
              Explore Cuisines
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/recipes" element={<Browse />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/submit" element={<SubmitRecipe />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-col brand-col">
            <Link to="/" className="nav-logo footer-logo">
              <span className="logo-icon">🍵</span>
              <span className="logo-text">matcha</span>
            </Link>
            <p className="footer-tagline">
              "Your passport has a kitchen." Matcha is the world's recipe box — real dishes from real cuisines, cooked by real people.
            </p>
            <span className="meta-text">© {new Date().getFullYear()} Matcha World Recipes Hub. All rights reserved.</span>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Explore Cuisines</h4>
            <ul className="footer-links">
              <li><Link to="/browse?cuisine=Italian">🇮🇹 Italian Cuisine</Link></li>
              <li><Link to="/browse?cuisine=Japanese">🇯🇵 Japanese Cuisine</Link></li>
              <li><Link to="/browse?cuisine=Mexican">🇲🇽 Mexican Cuisine</Link></li>
              <li><Link to="/browse?cuisine=Indian">🇮🇳 Indian Cuisine</Link></li>
              <li><Link to="/browse?cuisine=Moroccan">🇲🇦 Moroccan Cuisine</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-title">Courses & Categories</h4>
            <ul className="footer-links">
              <li><Link to="/browse?category=Starter">Starters & Appetizers</Link></li>
              <li><Link to="/browse?category=Main">Main Courses</Link></li>
              <li><Link to="/browse?category=Dessert">Desserts & Sweets</Link></li>
              <li><Link to="/browse?category=Breakfast">Breakfast & Brunch</Link></li>
              <li><Link to="/browse?category=Side">Side Dishes</Link></li>
            </ul>
          </div>

          <div className="footer-col newsletter-col">
            <h4 className="footer-title">Stay Cookin'</h4>
            <p className="footer-desc">Get a weekly global recipe delivered straight to your inbox. No ads, no fluff.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Matcha!'); }} className="newsletter-form">
              <input type="email" placeholder="Enter your email" required className="newsletter-input" />
              <button type="submit" className="btn-primary newsletter-btn">Subscribe</button>
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}