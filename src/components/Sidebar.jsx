import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'fa-table-columns', label: 'Dashboard', end: true },
  { to: '/ai-assistant', icon: 'fa-wand-magic-sparkles', label: 'AI Assistant' },
  { to: '/tools', icon: 'fa-briefcase', label: 'Business Tools' },
  { to: '/saved-items', icon: 'fa-bookmark', label: 'Saved Tools' },
  { to: '/favorites', icon: 'fa-heart', label: 'Favorites' },
  { to: '/analytics', icon: 'fa-chart-pie', label: 'Analytics' },
  { to: '/settings', icon: 'fa-gear', label: 'Settings' },
  { to: '/support', icon: 'fa-circle-question', label: 'Help & Support' },
];

// The mobile "More" drawer keeps a tighter, mockup-matching list —
// the four routes already on the bottom tab bar are left off since
// they're one tap away without opening this panel.
const MORE_NAV_ITEMS = [
  { to: '/dashboard', icon: 'fa-table-columns', label: 'Dashboard', end: true },
  { to: '/ai-assistant', icon: 'fa-wand-magic-sparkles', label: 'AI Assistant' },
  { to: '/customers', icon: 'fa-user-group', label: 'Customers' },
  { to: '/saved-items', icon: 'fa-bookmark', label: 'Saved Items' },
  { to: '/referrals', icon: 'fa-gift', label: 'Referrals' },
  { to: '/settings', icon: 'fa-gear', label: 'Settings' },
];

export default function Sidebar({ open, onClose }) {
  const { profile, logout } = useAuth();
  const initial = (profile?.full_name || profile?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <>
      {open && <div className="bn-sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      <aside className={`bn-sidebar ${open ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="More">
        {/* ---- Mobile-only header: title + close, matches the "More"
            panel mockup. Hidden on desktop where the sidebar is always
            visible and doesn't need a close affordance. ---- */}
        <div className="bn-sidebar-mobile-header">
          <span className="bn-sidebar-mobile-title">More</span>
          <button type="button" className="bn-sidebar-close" onClick={onClose} aria-label="Close menu">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="bn-sidebar-scroll">
          {profile && (
            <Link to="/dashboard" className="bn-sidebar-mobile-profile" onClick={onClose}>
              <span className="bn-sidebar-mobile-avatar">{initial}</span>
              <span className="bn-sidebar-mobile-profile-text">
                <span className="bn-sidebar-mobile-profile-name">{profile.full_name || profile.email.split('@')[0]}</span>
                <span className="bn-sidebar-mobile-profile-email">{profile.email}</span>
              </span>
            </Link>
          )}

          {/* ---- Desktop persistent nav (full list) ---- */}
          <nav className="bn-sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `bn-sidebar-link ${isActive ? 'is-active' : ''}`}
                onClick={onClose}
              >
                <i className={`fa-solid ${item.icon}`} />
                <span>{item.label}</span>
                {item.badge && <span className="bn-sidebar-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </nav>

          {/* ---- Mobile "More" drawer nav (compact list with chevrons) ---- */}
          <nav className="bn-sidebar-mobile-nav" aria-label="More">
            {MORE_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `bn-sidebar-mobile-row ${isActive ? 'is-active' : ''}`}
                onClick={onClose}
              >
                <span className="bn-sidebar-mobile-row-icon"><i className={`fa-solid ${item.icon}`} /></span>
                <span className="bn-sidebar-mobile-row-label">{item.label}</span>
                <i className="fa-solid fa-chevron-right bn-sidebar-mobile-row-chevron" />
              </NavLink>
            ))}
          </nav>

          <div className="bn-sidebar-mobile-section">
            <p className="bn-sidebar-mobile-section-title">Support</p>
            <nav className="bn-sidebar-mobile-nav">
              <Link to="/support" className="bn-sidebar-mobile-row" onClick={onClose}>
                <span className="bn-sidebar-mobile-row-icon"><i className="fa-solid fa-circle-question" /></span>
                <span className="bn-sidebar-mobile-row-label">Help Center</span>
                <i className="fa-solid fa-chevron-right bn-sidebar-mobile-row-chevron" />
              </Link>
              <Link to="/contact" className="bn-sidebar-mobile-row" onClick={onClose}>
                <span className="bn-sidebar-mobile-row-icon"><i className="fa-solid fa-headset" /></span>
                <span className="bn-sidebar-mobile-row-label">Contact Support</span>
                <i className="fa-solid fa-chevron-right bn-sidebar-mobile-row-chevron" />
              </Link>
            </nav>
          </div>

          {profile && (
            <div className="bn-sidebar-profile">
              <span className="bn-sidebar-profile-avatar">{initial}</span>
              <div className="bn-sidebar-profile-info">
                <p className="bn-sidebar-profile-name">{profile.full_name || profile.email.split('@')[0]}</p>
                <p className="bn-sidebar-profile-email">{profile.email}</p>
              </div>
            </div>
          )}

          <button className="bn-sidebar-link bn-sidebar-logout" onClick={() => { onClose?.(); logout(); }} type="button">
            <i className="fa-solid fa-right-from-bracket" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
