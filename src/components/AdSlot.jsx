import { useEffect, useRef, useState } from 'react';
import { getItem } from '../utils/storage';
import '../styles/AdSlot.css';

// Your real AdSense publisher ID (already live in index.html's loader script).
const ADSENSE_CLIENT = 'ca-pub-9529159848617968';

// Fill these in AFTER AdSense approval, once you've created one ad unit
// per placement (AdSense dashboard > Ads > By ad unit > Display ads).
// Each unit gives you a numeric data-ad-slot value — paste it below.
// Leave a value as null until you have the real one; AdSlot will safely
// fall back to the AdSterra native banner widget for that spot instead of
// rendering a broken ad (which is what fake/placeholder slot IDs would do).
const ADSENSE_SLOTS = {
  banner: null,
  sidebar: null,
  'in-content': null,
  sponsored: null,
};

const isClientConfigured = !!ADSENSE_CLIENT && !ADSENSE_CLIENT.includes('XXXX');

// ---------------------------------------------------------------------
// AdSterra native banner — this is what actually shows at every
// placement right now (banner/sidebar/in-content/sponsored) since none
// of the AdSense slot IDs above are filled in yet.
//
// AdSterra's invoke.js is tied to one fixed container id, so only one
// copy of the widget can be live on a page at once. If two <AdSlot>
// instances ever mount at the same time (e.g. a page with two
// "in-content" slots), the first one to mount claims the live widget;
// any others fall back to the plain styled slot instead of a second,
// empty container sharing the same id.
// ---------------------------------------------------------------------
const ADSTERRA_CONTAINER_ID = 'container-e785bb13515f0ec11bd8e28a63d15491';
const ADSTERRA_SRC =
  'https://pl30489873.effectivecpmnetwork.com/e785bb13515f0ec11bd8e28a63d15491/invoke.js';

let adsterraClaimed = false;

function AdsterraNativeBanner({ type, label }) {
  const hostRef = useRef(null);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (adsterraClaimed) return; // another instance already owns this zone
    adsterraClaimed = true;
    setClaimed(true);
    return () => {
      // Release the claim on unmount (route change, etc.) so the widget
      // can render again on whichever page needs it next.
      adsterraClaimed = false;
    };
  }, []);

  useEffect(() => {
    if (!claimed || !hostRef.current) return;

    const container = document.createElement('div');
    container.id = ADSTERRA_CONTAINER_ID;

    const script = document.createElement('script');
    script.async = true;
    script.dataset.cfasync = 'false';
    script.src = ADSTERRA_SRC;

    hostRef.current.appendChild(container);
    hostRef.current.appendChild(script);
  }, [claimed]);

  if (!claimed) {
    return (
      <div className={`bn-ad-slot bn-ad-${type}`} aria-label={label}>
        <span className="bn-ad-label">{label}</span>
      </div>
    );
  }

  return (
    <div className={`bn-ad-slot bn-ad-native bn-ad-${type}`} aria-label={label}>
      <span className="bn-ad-native-tag">{label}</span>
      <div className="bn-ad-native-frame" ref={hostRef} />
    </div>
  );
}

/**
 * type: 'banner' | 'sidebar' | 'in-content' | 'sponsored'
 *
 * Renders a real Google AdSense unit only once BOTH the client ID and
 * that specific placement's slot ID are filled in above. Until a slot ID
 * is set, it renders the AdSterra native banner widget instead — this
 * avoids ever shipping a broken/blank `<ins>` tag with a fake slot ID,
 * which would show as an ad error to visitors (and to an AdSense
 * reviewer).
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
    return <AdsterraNativeBanner type={type} label={label} />;
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
