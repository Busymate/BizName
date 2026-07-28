import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { APP_VERSION } from '../config/version';

// Matches the top nav's own link set exactly (Home / Tools / Templates /
// Business Tips / Blog / About Us) so the drawer is a faithful mobile
// mirror of the desktop nav, not a bigger menu with extra items.
const PRIMARY_LINKS = [
  { to: '/', label: 'Home', icon: 'house', end: true },
  { to: '/tools', label: 'Tools', icon: 'table-cells-large' },
  { to: '/templates', label: 'Templates', icon: 'file-lines' },
  { to: '/business-tips', label: 'Business Tips', icon: 'lightbulb' },
  { to: '/blog', label: 'Blog', icon: 'newspaper' },
  { to: '/about', label: 'About Us', icon: 'circle-info' },
];

export default function MobileNav({ isOpen, onClose, session, profile }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    onClose();
    navigate(q ? `/tools?q=${encodeURIComponent(q)}` : '/tools');
    setSearchTerm('');
  };

  const initial = (profile?.full_name || profile?.email || '?').trim().charAt(0).toUpperCase();
  const isPremium = profile?.plan === 'premium';
  const year = new Date().getFullYear();

  return (
    <>
      <div
        className={`bn-mnav-backdrop ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`bn-mnav ${isOpen ? 'is-open' : ''}`}
        id="bn-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
      >
        <div className="bn-mnav-scroll">
          <div className="bn-mnav-header">
            <Link to="/" className="bn-mnav-brand" onClick={onClose}>
              <span className="bn-mnav-logo">B</span>
              <span className="bn-mnav-brand-text">
                <span className="bn-mnav-name">BizName</span>
                <span className="bn-mnav-tagline">Free Business Hub</span>
              </span>
            </Link>
            <button
              type="button"
              className="bn-mnav-icon-btn bn-mnav-close"
              onClick={onClose}
              aria-label="Close menu"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          {session && (
            <Link to="/dashboard" className="bn-mnav-profile" onClick={onClose}>
              <span className="bn-mnav-avatar">{initial}</span>
              <span className="bn-mnav-profile-text">
                <span className="bn-mnav-profile-name">{profile?.full_name || 'Your account'}</span>
                <span className="bn-mnav-profile-email">{profile?.email}</span>
              </span>
              <span className={`bn-mnav-plan-pill ${isPremium ? 'bn-mnav-plan-pill-premium' : ''}`}>
                {isPremium ? 'Premium' : 'Free Plan'}
              </span>
            </Link>
          )}

          <form className="bn-mnav-search" onSubmit={submitSearch} role="search">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="search"
              placeholder="Search tools, templates…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search tools, templates, or articles"
            />
          </form>

          <nav className="bn-mnav-primary" aria-label="Primary">
            {PRIMARY_LINKS.map((link, i) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className="bn-mnav-row"
                style={{ '--bn-mnav-i': i }}
              >
                <span className="bn-mnav-row-icon"><i className={`fa-solid fa-${link.icon}`} /></span>
                <span className="bn-mnav-row-label">{link.label}</span>
                <i className="fa-solid fa-chevron-right bn-mnav-row-chevron" />
              </NavLink>
            ))}
          </nav>

          <div className="bn-mnav-spacer" />

          {session && !isPremium && (
            <Link to="/settings" className="bn-mnav-upgrade" onClick={onClose}>
              <span className="bn-mnav-upgrade-icon"><i className="fa-solid fa-crown" /></span>
              <span className="bn-mnav-upgrade-text">
                <span className="bn-mnav-upgrade-title">Upgrade to Pro</span>
                <span className="bn-mnav-upgrade-sub">Unlock unlimited access to premium tools and features.</span>
              </span>
              <i className="fa-solid fa-chevron-right bn-mnav-upgrade-chevron" />
            </Link>
          )}

          {!session && (
            <div className="bn-mnav-auth">
              <Link to="/login" onClick={onClose} className="bn-mnav-auth-btn bn-mnav-auth-outline">Log In</Link>
              <Link to="/signup" onClick={onClose} className="bn-mnav-auth-btn bn-mnav-auth-solid">Create Account</Link>
            </div>
          )}

          <div className="bn-mnav-footer">
            <span>v{APP_VERSION}</span>
            <span className="bn-mnav-footer-dot">·</span>
            <Link to="/contact" onClick={onClose}>Contact</Link>
            <span className="bn-mnav-footer-dot">·</span>
            <Link to="/privacy-policy" onClick={onClose}>Privacy</Link>
            <span className="bn-mnav-footer-dot">·</span>
            <Link to="/terms-of-service" onClick={onClose}>Terms</Link>
            <span className="bn-mnav-footer-full">© {year} BizName</span>
          </div>
        </div>
      </aside>
    </>
  );
}
