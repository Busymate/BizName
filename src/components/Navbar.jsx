import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../lib/dashboardStats';
import { RELEASE_HISTORY } from '../config/version';
import { KEYS, getItem } from '../utils/storage';
import NotificationsModal from './NotificationsModal';
import '../styles/Navbar.css';

export default function Navbar() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [accountOpen, setAccountOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { session, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const accountRef = useRef(null);

  const closeMenu = () => {
    setToolsOpen(false);
  };

  // Close the desktop "Tools" dropdown whenever the route changes (e.g.
  // tapping a link, or navigating via browser back/forward).
  useEffect(() => {
    closeMenu();
  }, [location.pathname, location.search]);

  // Close the desktop "Tools" dropdown on outside click/tap.
  useEffect(() => {
    if (!toolsOpen) return;
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [toolsOpen]);

  // Close on Escape key for keyboard users (desktop "Tools" dropdown).
  useEffect(() => {
    if (!toolsOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [toolsOpen]);

  // Drives the sticky navbar's "scrolled" look (tighter height, real
  // shadow instead of the flat border) — CSS handles the actual
  // transition, this just flips a class past a small threshold so it
  // doesn't flicker right at scrollTop 0/1.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Badge count: unread "What's New" (latest release not yet opened in
  // the notifications modal) + how many customers currently have an
  // overdue invoice — the exact same overdue-invoice figure the
  // dashboard and AI Business Advisor use, so the bell never claims
  // something the rest of the app doesn't also show.
  useEffect(() => {
    if (!session || !profile) { setNotifCount(0); return; }
    let cancelled = false;
    const unseenRelease = getItem(KEYS.NOTIFICATIONS_SEEN_VERSION, null) !== RELEASE_HISTORY[0].version ? 1 : 0;
    getDashboardStats()
      .then((stats) => { if (!cancelled) setNotifCount((stats.overdueInvoices?.length || 0) + unseenRelease); })
      .catch(() => { if (!cancelled) setNotifCount(unseenRelease); });
    return () => { cancelled = true; };
  }, [session, profile, notifOpen]);

  useEffect(() => {
    if (!accountOpen) return undefined;
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/tools?q=${encodeURIComponent(q)}` : '/tools');
    setSearchTerm('');
  };

  const initial = (profile?.full_name || profile?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <header className={`bn-navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="bn-navbar-inner">
        <Link to="/" className="bn-logo" onClick={closeMenu}>
          <span className="bn-logo-badge">B</span>
          <span className="bn-logo-text-wrap">
            <span className="bn-logo-text">BizName</span>
            <span className="bn-logo-tagline">Free Business Tools</span>
          </span>
        </Link>

        {/* Desktop top nav only — on mobile/tablet, navigation moves to the
            fixed bottom tab bar (BottomTabBar) instead of a drawer. */}
        <nav className="bn-nav-links" ref={navRef}>
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
        </nav>

        <div className="bn-navbar-actions">
          {session && (
            <form className="bn-navbar-search" onSubmit={submitSearch} role="search">
              <i className="fa-solid fa-magnifying-glass" />
              <input
                type="search"
                placeholder="Search tools, templates, or articles"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search tools and templates"
              />
              <kbd>⌘K</kbd>
            </form>
          )}

          <button
            className="bn-icon-btn"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            type="button"
          >
            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`} />
          </button>


          {session && (
            <>
              <button
                className="bn-icon-btn bn-bell-btn"
                onClick={() => setNotifOpen(true)}
                aria-label="Notifications"
                type="button"
              >
                <i className="fa-solid fa-bell" />
                {notifCount > 0 && <span className="bn-bell-badge">{notifCount > 9 ? '9+' : notifCount}</span>}
              </button>
              <NotificationsModal open={notifOpen} onClose={() => setNotifOpen(false)} profile={profile} />
            </>
          )}

          {session ? (
            <>
              <div className="bn-account-menu" ref={accountRef}>
                <button
                  className="bn-account-trigger"
                  onClick={() => setAccountOpen((o) => !o)}
                  type="button"
                  aria-expanded={accountOpen}
                  aria-haspopup="true"
                >
                  <span className="bn-account-avatar">{initial}</span>
                  <span className="bn-account-name">{profile?.full_name || profile?.email?.split('@')[0] || 'Account'}</span>
                  <i className="fa-solid fa-chevron-down" />
                </button>
                {accountOpen && (
                  <div className="bn-account-dropdown">
                    <Link to="/dashboard" onClick={() => setAccountOpen(false)}><i className="fa-solid fa-table-columns" /> Dashboard</Link>
                    <Link to="/settings" onClick={() => setAccountOpen(false)}><i className="fa-solid fa-gear" /> Settings</Link>
                    <Link to="/support" onClick={() => setAccountOpen(false)}><i className="fa-solid fa-circle-question" /> Help &amp; Support</Link>
                    <button type="button" onClick={() => { setAccountOpen(false); logout(); }}><i className="fa-solid fa-right-from-bracket" /> Logout</button>
                  </div>
                )}
              </div>

              {/* Mobile/tablet only: tapping the avatar goes straight to the
                  dashboard instead of opening the desktop dropdown — there's
                  no hamburger menu anymore, so this is the one entry point
                  into the dashboard from every public page. */}
              <Link to="/dashboard" className="bn-mobile-avatar-link" aria-label="Go to your dashboard">
                <span className="bn-account-avatar">{initial}</span>
              </Link>
            </>
          ) : (
            <>
              <button className="bn-navbar-cta-btn bn-navbar-cta-outline" onClick={() => navigate('/login')} type="button">
                <span>Log In</span>
              </button>
              <button className="bn-navbar-cta-btn" onClick={() => navigate('/signup')} type="button">
                <span>Sign Up</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
