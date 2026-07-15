import { Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import '../styles/CookieConsent.css';

const CONSENT_KEY = 'bizname_cookie_consent';

/**
 * Simple, non-blocking cookie notice. Required-ish for AdSense approval
 * and good practice for GDPR/EU visitors, since this site serves Google
 * AdSense ads that use cookies for ad personalization (see Privacy
 * Policy). Consent choice is remembered in localStorage so the banner
 * only shows once per browser.
 */
export default function CookieConsent() {
  const [consent, setConsent] = useLocalStorage(CONSENT_KEY, null);

  if (consent) return null;

  return (
    <div className="bn-cookie-banner" role="dialog" aria-label="Cookie consent">
      <p>
        We use cookies, including from Google AdSense, to run this site and to serve relevant ads.
        By continuing to use BizName, you agree to our{' '}
        <Link to="/privacy-policy">Privacy Policy</Link>.
      </p>
      <div className="bn-cookie-actions">
        <button className="bn-cookie-decline" onClick={() => setConsent('declined')} type="button">
          Decline Personalization
        </button>
        <button className="bn-cookie-accept" onClick={() => setConsent('accepted')} type="button">
          Accept
        </button>
      </div>
    </div>
  );
}
