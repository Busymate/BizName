import { NavLink, useLocation } from 'react-router-dom';
import tools from '../data/tools';
import '../styles/BottomTabBar.css';

// The four routes that get their own dedicated tab. Every other
// signed-in page (Settings, Referrals, Favorites, Analytics, Support,
// invoice details…) is reached through the "More" drawer, so the More
// tab lights up whenever the current route isn't one of these four —
// matching the mobile mockup's Dashboard / AI Assistant / Customers /
// Saved Items / More layout.
const DASHBOARD_TABS = [
  { to: '/dashboard', icon: 'fa-table-columns', label: 'Dashboard', end: true },
  { to: '/ai-assistant', icon: 'fa-wand-magic-sparkles', label: 'AI Assistant' },
  { to: '/customers', icon: 'fa-users', label: 'Customers' },
  { to: '/saved-items', icon: 'fa-bookmark', label: 'Saved Items' },
];

// Mirrors the desktop top nav's own link set (Home / Tools / Templates /
// Business Tips / Blog / About Us) — this is the mobile/tablet
// equivalent of that nav, not a shorter subset of it. No "Dashboard"
// entry here on purpose: on these pages the avatar in the top bar is
// the one entry point into the dashboard (see Navbar.jsx).
const PUBLIC_TABS = [
  { to: '/', icon: 'fa-house', label: 'Home', end: true },
  { to: '/tools', icon: 'fa-table-cells-large', label: 'Tools' },
  { to: '/templates', icon: 'fa-file-lines', label: 'Templates' },
  { to: '/business-tips', icon: 'fa-lightbulb', label: 'Business Tips' },
  { to: '/blog', icon: 'fa-newspaper', label: 'Blog' },
  { to: '/about', icon: 'fa-circle-info', label: 'About Us' },
];

const TOOL_SLUGS = new Set(tools.map((t) => t.slug));

/**
 * Fixed, always-visible mobile/tablet bottom navigation — used for both
 * the public site (variant="public": Home/Tools/Templates/Business
 * Tips/Blog/About Us, no "More") and the signed-in dashboard section
 * (variant="dashboard", the default: Dashboard/AI Assistant/Customers/
 * Saved Items + a "More" tab that opens the Sidebar as a slide-in
 * drawer for everything else). Hidden on desktop via CSS — the top nav
 * links cover navigation there for public pages, and the permanent left
 * Sidebar covers it for the dashboard. Respects the device safe-area
 * inset so it doesn't sit under the home indicator on notched phones.
 */
export default function BottomTabBar({ variant = 'dashboard', onMoreClick, moreActive }) {
  const { pathname } = useLocation();

  if (variant === 'public') {
    // Any tool page (e.g. /vat-calculator) counts as "under" Tools for
    // highlighting purposes, same way the desktop nav's Tools dropdown
    // covers every tool without a literal /tools/* URL structure. Any
    // /blog/:slug article counts as "under" Blog the same way.
    const isToolPage = TOOL_SLUGS.has(pathname.replace(/^\//, ''));
    return (
      <nav className="bn-bottom-tabs bn-bottom-tabs-public" aria-label="Primary">
        {PUBLIC_TABS.map((tab) => {
          const isBlog = tab.to === '/blog' && pathname.startsWith('/blog/');
          const isTools = tab.to === '/tools' && isToolPage;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) => `bn-bottom-tab ${isActive || isBlog || isTools ? 'is-active' : ''}`}
            >
              <i className={`fa-solid ${tab.icon}`} />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    );
  }

  const isPrimaryRoute = DASHBOARD_TABS.some((tab) => (tab.end ? pathname === tab.to : pathname.startsWith(tab.to)));
  const isMoreActive = moreActive || !isPrimaryRoute;

  return (
    <nav className="bn-bottom-tabs" aria-label="Primary">
      {DASHBOARD_TABS.map((tab) => (
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
        <i className="fa-solid fa-bars" />
        <span>More</span>
      </button>
    </nav>
  );
}
