import { useEffect, useState } from 'react';
import '../styles/OfflineScreen.css';

// BizName is an online-only app — every feature needs the backend
// (Supabase, the Express API, Cloudinary, Flutterwave, and AdSense all
// need a live connection). Rather than a cached "offline.html" fallback
// page (which would mean the service worker caching page content — the
// opposite of what an online-only app wants), this listens to the
// browser's own online/offline events and blocks the app with a plain
// React overlay when there's no connection.
export default function OfflineScreen() {
  const [online, setOnline] = useState(navigator.onLine);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (online) return null;

  const handleRetry = () => {
    setRetrying(true);
    // navigator.onLine can be stale in some browsers until the next
    // network event fires — a real fetch is a more reliable check than
    // trusting the flag alone.
    fetch('/favicon.svg', { cache: 'no-store' })
      .then(() => setOnline(true))
      .catch(() => setOnline(navigator.onLine))
      .finally(() => setRetrying(false));
  };

  return (
    <div className="bn-offline-screen" role="alert">
      <div className="bn-offline-card">
        <div className="bn-offline-icon"><i className="fa-solid fa-wifi-slash" /></div>
        <h1>You're Offline</h1>
        <p>
          BizName requires an internet connection. Please reconnect to continue using business
          tools, AI features, cloud synchronization, and other online services.
        </p>
        <button onClick={handleRetry} disabled={retrying} type="button">
          {retrying ? 'Checking…' : 'Retry Connection'}
        </button>
      </div>
    </div>
  );
}
