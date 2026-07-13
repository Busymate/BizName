import SEO from '../components/SEO';
import '../styles/LegalPage.css';

export default function PrivacyPolicy() {
  return (
    <div className="bn-container bn-legal-page">
      <SEO title="Privacy Policy" description="Read BizName's privacy policy to understand how we handle your data." path="/privacy-policy" />
      <h1>Privacy Policy</h1>
      <p className="bn-legal-updated">Last updated: January 2026</p>

      <h2>1. Overview</h2>
      <p>BizName is a client-side application. Every tool on this site runs entirely in your browser — there is no backend server and no database. Your calculations, saved results, favorites and preferences are stored only in your browser's local storage on your own device.</p>

      <h2>2. Information We Collect</h2>
      <p>We do not collect, transmit, or store any personal or business data you enter into our tools. Contact and feedback forms on this site are for demonstration purposes and are not connected to a live backend in this build.</p>

      <h2>3. Local Storage</h2>
      <p>We use your browser's local storage to remember your favorite tools, recently used tools, dark mode preference, saved calculations, and bookmarked templates. This data never leaves your device and can be cleared at any time by clearing your browser data.</p>

      <h2>4. Cookies &amp; Advertising</h2>
      <p>If ad placements (such as Google AdSense) are enabled on this site, third-party ad providers may use cookies to serve relevant ads. You can control cookie preferences through your browser settings.</p>

      <h2>5. Third-Party Links</h2>
      <p>Our blog and articles may link to third-party websites. We are not responsible for the privacy practices of external sites.</p>

      <h2>6. Changes to This Policy</h2>
      <p>We may update this policy from time to time. Changes will be posted on this page with an updated revision date.</p>

      <h2>7. Contact</h2>
      <p>If you have questions about this policy, please reach out via our Contact page.</p>
    </div>
  );
}
