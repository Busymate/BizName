import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode';
import '../styles/Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
    setToolsOpen(false);
  };

  return (
    <header className="bn-navbar">
      <div className="bn-navbar-inner">
        <Link to="/" className="bn-logo" onClick={closeMenu}>
          <span className="bn-logo-badge">B</span>
          <span className="bn-logo-text">BizName</span>
        </Link>

        <nav className={`bn-nav-links ${menuOpen ? 'is-open' : ''}`}>
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <div className={`bn-dropdown ${toolsOpen ? 'is-open' : ''}`}>
            <button
              className="bn-dropdown-trigger"
              onClick={() => setToolsOpen((o) => !o)}
              type="button"
            >
              Tools <i className="fa-solid fa-chevron-down" />
            </button>
            <div className="bn-dropdown-menu">
              <Link to="/tools" onClick={closeMenu}>All Tools</Link>
              <Link to="/tools?category=Financial%20Tools" onClick={closeMenu}>Financial Tools</Link>
              <Link to="/tools?category=Invoice%20%26%20Documents" onClick={closeMenu}>Invoice &amp; Documents</Link>
              <Link to="/tools?category=Marketing%20Tools" onClick={closeMenu}>Marketing Tools</Link>
            </div>
          </div>
          <NavLink to="/templates" onClick={closeMenu}>Templates</NavLink>
          <NavLink to="/business-tips" onClick={closeMenu}>Business Tips</NavLink>
          <NavLink to="/blog" onClick={closeMenu}>Blog</NavLink>
          <NavLink to="/about" onClick={closeMenu}>About Us</NavLink>
        </nav>

        <div className="bn-navbar-actions">
          <button
            className="bn-icon-btn"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            type="button"
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`} />
          </button>
          <button
            className="bn-favorites-btn"
            onClick={() => navigate('/tools?favorites=1')}
            type="button"
          >
            <i className="fa-solid fa-star" /> Favorites
          </button>
          <button
            className="bn-icon-btn bn-menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            type="button"
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
