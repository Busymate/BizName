import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import AdSlot from '../components/AdSlot';
import '../styles/LegalPage.css';

export default function PrivacyPolicy() {
  return (
    <div className="bn-container bn-legal-page">
      <SEO title="Privacy Policy" description="Read BizName's privacy policy to understand how we handle your data and use of cookies." path="/privacy-policy" />
      <h1>Privacy Policy</h1>
      <p className="bn-legal-updated">Last updated: January 2026</p>

      <AdSlot type="banner" label="Advertisement" />

      <h2>1. Overview</h2>
      <p>BizName ("we", "us", "our") is a client-side application. Every tool on this site runs entirely in your browser — there is no backend server and no database. This policy explains what data is involved when you use BizName, including data handled by third-party services such as Google AdSense.</p>

      <h2>2. Information We Collect</h2>
      <p>We do not collect, transmit, or store any personal or business data you enter into our tools on a server. Contact and feedback forms on this site are for gathering your message and are not used for any purpose beyond responding to you.</p>

      <h2>3. Local Storage</h2>
      <p>We use your browser's local storage to remember your recently used tools and dark mode preference — this data never leaves your device and can be cleared at any time by clearing your browser data. If you create a free account, your Saved Items (invoices, receipts, calculations, and bookmarked templates) are stored securely in your account so you can access them from any device.</p>

      <h2>4. Cookies &amp; Advertising</h2>
      <p>This site displays advertisements served by third-party ad networks, including AdSterra and (once enabled) Google AdSense. These networks may use cookies or similar technologies to serve ads, including based on your prior visits to this and other websites.</p>
      <p>You may opt out of personalized advertising by visiting Google's Ads Settings at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>. Alternatively, you can opt out of participating vendors' use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.</p>
      <p>Third-party ad vendors may use cookies to serve ads based on a user's prior visits to this website or other websites. This allows them and their partners to serve ads to you based on your visit to our site and/or other sites on the internet, in accordance with their own advertising policies.</p>

      <h2>5. Your Choices Regarding Cookies</h2>
      <p>Most browsers let you refuse or delete cookies through their settings. If you disable cookies, some parts of this site (including ad personalization) may not work as intended. On your first visit, this site shows a cookie notice so you can choose how cookies are used.</p>

      <h2>6. Children's Privacy</h2>
      <p>BizName is intended for business owners, freelancers, and adults managing a business. We do not knowingly collect personal information from children under 13.</p>

      <h2>7. Third-Party Links</h2>
      <p>Our blog and articles may link to third-party websites. We are not responsible for the privacy practices or content of external sites.</p>

      <h2>8. Changes to This Policy</h2>
      <p>We may update this policy from time to time. Changes will be posted on this page with an updated revision date.</p>

      <h2>9. Contact</h2>
      <p>If you have questions about this policy, please reach out via our <Link to="/contact">Contact page</Link>.</p>
    </div>
  );
}
