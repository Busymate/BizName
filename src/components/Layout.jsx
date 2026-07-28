import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import FloatingAIWidget from './FloatingAIWidget';

export default function Layout({ children }) {
  const { pathname } = useLocation();
  // The floating bubble is available everywhere (every tool page,
  // article, and dashboard screen) except the dedicated /ai-assistant
  // page itself, which is already the full chat experience — showing
  // both at once would just be two overlapping AI panels.
  const showFloatingWidget = pathname !== '/ai-assistant';

  return (
    <div className="bn-app-shell">
      <Navbar />
      <main className="bn-main">{children}</main>
      <Footer />
      <CookieConsent />
      {showFloatingWidget && <FloatingAIWidget />}
    </div>
  );
}
