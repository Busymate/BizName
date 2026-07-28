import { NavLink, useLocation } from 'react-router-dom';
import '../styles/BottomTabBar.css';

// The four routes that get their own dedicated tab. Every other
// signed-in page (Settings, Referrals, Favorites, Analytics, Support,
// invoice details…) is reached through the "More" drawer, so the More
// tab lights up whenever the current route isn't one of these four —
// matching the mobile mockup's Dashboard / AI Assistant / Customers /
// Saved Items / More layout.
const TABS = [
  { to: '/dashboard', icon: 'fa-table-columns', label: 'Dashboard', end: true },
  { to: '/ai-assistant', icon: 'fa-wand-magic-sparkles', label: 'AI Assistant' },
  { to: '/customers', icon: 'fa-users', label: 'Customers' },
  { to: '/saved-items', icon: 'fa-bookmark', label: 'Saved Items' },
];

// Mobile-only bottom navigation for the logged-in app section. Hidden on
// desktop via CSS (the left Sidebar covers navigation there). Respects
// the device safe-area inset so it doesn't sit under the home indicator
// on notched phones.
export default function BottomTabBar({ onMoreClick, moreActive }) {
  const { pathname } = useLocation();
  const isPrimaryRoute = TABS.some((tab) => (tab.end ? pathname === tab.to : pathname.startsWith(tab.to)));
  const isMoreActive = moreActive || !isPrimaryRoute;

  return (
    <nav className="bn-bottom-tabs" aria-label="Primary">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `bn-bottom-tab ${isActive ? 'is-active' : ''}`}
        >
          <i className={`fa-solid ${tab.icon}`} />
          <span>{tab.label}</span>
        </NavLink>
      ))}
      <button
        type="button"
        className={`bn-bottom-tab bn-bottom-tab-more ${isMoreActive ? 'is-active' : ''}`}
        onClick={onMoreClick}
        aria-haspopup="true"
        aria-expanded={!!moreActive}
      >
        <i className="fa-solid fa-ellipsis" />
        <span>More</span>
      </button>
    </nav>
  );
}
