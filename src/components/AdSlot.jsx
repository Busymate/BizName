import { useEffect, useRef } from 'react';
import { getItem } from '../utils/storage';
import '../styles/AdSlot.css';

// Your real AdSense publisher ID (already live in index.html's loader script).
const ADSENSE_CLIENT = 'ca-pub-9529159848617968';

// Fill these in AFTER AdSense approval, once you've created one ad unit
// per placement (AdSense dashboard > Ads > By ad unit > Display ads).
// Each unit gives you a numeric data-ad-slot value — paste it below.
// Leave a value as null until you have the real one; AdSlot will safely
// fall back to the placeholder box for that spot instead of rendering a
// broken ad (which is what fake/placeholder slot IDs would do).
const ADSENSE_SLOTS = {
  banner: null,
  sidebar: null,
  'in-content': null,
  sponsored: null,
};

const isClientConfigured = !!ADSENSE_CLIENT && !ADSENSE_CLIENT.includes('XXXX');

/**
 * type: 'banner' | 'sidebar' | 'in-content' | 'sponsored'
 *
 * Renders a real Google AdSense unit only once BOTH the client ID and
 * that specific placement's slot ID are filled in above. Until a slot ID
 * is set, it renders the visible placeholder box instead — this avoids
 * ever shipping a broken/blank `<ins>` tag with a fake slot ID, which
 * would show as an ad error to visitors (and to an AdSense reviewer).
 *
 * Respects the choice made in <CookieConsent>: if the visitor declined
 * personalization, ads are requested as non-personalized.
 */
export default function AdSlot({ type = 'banner', label = 'Advertisement' }) {
  const insRef = useRef(null);
  const pushed = useRef(false);
  const slot = ADSENSE_SLOTS[type];
  const isReady = isClientConfigured && !!slot;

  useEffect(() => {
    if (!isReady || pushed.current) return;
    try {
      const consent = getItem('bizname_cookie_consent', null);
      window.adsbygoogle = window.adsbygoogle || [];
      if (consent === 'declined') {
        window.adsbygoogle.requestNonPersonalizedAds = 1;
      }
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // adsbygoogle.js not loaded yet (blocked, offline, or dev mode) —
      // the placeholder below stays visible instead.
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <div className={`bn-ad-slot bn-ad-${type}`} aria-label={label}>
        <span className="bn-ad-label">{label}</span>
      </div>
    );
  }

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle bn-ad-${type}`}
      style={{ display: 'block' }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
