import { useEffect, useRef } from 'react';
import '../styles/AdSlot.css';

// Fill these in once your AdSense account is approved.
// Client ID: Account > Settings > Account information.
// Slot IDs: create one ad unit per placement in Ads > By ad unit, then
// paste each unit's data-ad-slot value below.
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX';
const ADSENSE_SLOTS = {
  banner: '1111111111',
  sidebar: '2222222222',
  'in-content': '3333333333',
  sponsored: '4444444444',
};

const isAdSenseConfigured = !ADSENSE_CLIENT.includes('XXXX');

/**
 * type: 'banner' | 'sidebar' | 'in-content' | 'sponsored'
 *
 * Renders a real Google AdSense unit once ADSENSE_CLIENT/ADSENSE_SLOTS
 * above are filled in and the loader script in index.html is uncommented.
 * Until then (or if adsbygoogle fails to load, e.g. an ad blocker), it
 * falls back to a visible placeholder so the layout never breaks.
 */
export default function AdSlot({ type = 'banner', label = 'Advertisement' }) {
  const insRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!isAdSenseConfigured || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle.js not loaded yet (blocked, offline, or dev mode) —
      // the placeholder below stays visible instead.
    }
  }, []);

  if (!isAdSenseConfigured) {
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
      data-ad-slot={ADSENSE_SLOTS[type]}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
