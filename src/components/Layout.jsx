import Navbar from './Navbar';
import Footer from './Footer';
import CookieConsent from './CookieConsent';

export default function Layout({ children }) {
  return (
    <div className="bn-app-shell">
      <Navbar />
      <main className="bn-main">{children}</main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
