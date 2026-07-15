import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode';
import '../styles/Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const toggleBtnRef = useRef(null);

  const closeMenu = () => {
    setMenuOpen(false);
    setToolsOpen(false);
  };

  // Close the mobile menu whenever the route changes (e.g. tapping a link,
  // or navigating via browser back/forward).
  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search]);

  // Close on outside click/tap — covers both the mobile slide-in panel
  // and the desktop "Tools" dropdown.
  useEffect(() => {
    if (!menuOpen && !toolsOpen) return;
    const handleClickOutside = (e) => {
      if (
        navRef.current &&
        !navRef.current.contains(e.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen, toolsOpen]);

  // Close on Escape key for keyboard users.
  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeMenu();
        toggleBtnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  // Lock body scroll while the mobile menu is open so the page behind it
  // doesn't scroll along with the slide-in panel.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="bn-navbar">
      <div className="bn-navbar-inner">
        <Link to="/" className="bn-logo" onClick={closeMenu}>
          <span className="bn-logo-badge">B</span>
          <span className="bn-logo-text">BizName</span>
        </Link>

        {menuOpen && <div className="bn-nav-backdrop" onClick={closeMenu} aria-hidden="true" />}

        <nav id="bn-mobile-nav" className={`bn-nav-links ${menuOpen ? 'is-open' : ''}`} ref={navRef}>
          <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
          <div className={`bn-dropdown ${toolsOpen ? 'is-open' : ''}`}>
            <button
              className="bn-dropdown-trigger"
              onClick={() => setToolsOpen((o) => !o)}
              aria-expanded={toolsOpen}
              aria-haspopup="true"
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

          <div className="bn-nav-mobile-actions">
            <Link to="/contact" onClick={closeMenu}>Contact Us</Link>
          </div>
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
            <i className="fa-solid fa-star" /> <span>Favorites</span>
          </button>
          <button
            ref={toggleBtnRef}
            className="bn-icon-btn bn-menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="bn-mobile-nav"
            type="button"
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
