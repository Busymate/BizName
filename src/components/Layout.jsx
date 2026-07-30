import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import FloatingAIWidget from './FloatingAIWidget';
import BottomTabBar from './BottomTabBar';

// Routes that already render their own (dashboard-variant) bottom tab
// bar via DashboardLayout, plus the payment callback screen — a
// transient redirect with nothing to navigate away to — so Layout
// never doubles up a second bottom bar underneath either of these.
const DASHBOARD_PATH_PREFIXES = [
  '/dashboard',
  '/ai-assistant',
  '/invoice/',
  '/saved-items',
  '/customers',
  '/referrals',
  '/favorites',
  '/analytics',
  '/settings',
  '/support',
];

export default function Layout({ children }) {
  const { pathname } = useLocation();
  // The floating bubble is available everywhere (every tool page,
  // article, and dashboard screen) except the dedicated /ai-assistant
  // page itself, which is already the full chat experience — showing
  // both at once would just be two overlapping AI panels.
  const showFloatingWidget = pathname !== '/ai-assistant';
  const isDashboardRoute = DASHBOARD_PATH_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <div className="bn-app-shell">
      <Navbar />
      <main className="bn-main">{children}</main>
      {!isDashboardRoute && <BottomTabBar variant="public" />}
      <Footer />
      <CookieConsent />
      {showFloatingWidget && <FloatingAIWidget />}
    </div>
  );
}
