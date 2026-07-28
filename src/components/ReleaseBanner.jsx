import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_VERSION, RELEASE_NAME, RELEASE_NOTES } from '../config/version';
import '../styles/ReleaseBanner.css';

const SEEN_KEY = 'bn-seen-release-version';

export default function ReleaseBanner() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let seen = null;
    try { seen = window.localStorage.getItem(SEEN_KEY); } catch { /* private browsing etc. */ }
    if (seen !== APP_VERSION) setShow(true);
  }, []);

  const dismiss = () => {
    try { window.localStorage.setItem(SEEN_KEY, APP_VERSION); } catch { /* ignore */ }
    setShow(false);
  };

  const viewChangelog = () => {
    dismiss();
    navigate('/whats-new');
  };

  if (!show) return null;

  return (
    <div className="bn-release-banner-backdrop" role="dialog" aria-modal="true" aria-labelledby="bn-release-banner-title">
      <div className="bn-release-banner">
        <div className="bn-release-banner-icon">🎉</div>
        <h2 id="bn-release-banner-title">Welcome to BizName v{APP_VERSION}</h2>
        <p className="bn-release-banner-subtitle">{RELEASE_NAME}</p>
        <p className="bn-release-banner-label">What's New</p>
        <ul>
          {RELEASE_NOTES.slice(0, 4).map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
        <div className="bn-release-banner-actions">
          <button onClick={dismiss} type="button" className="bn-release-banner-dismiss">Dismiss</button>
          <button onClick={viewChangelog} type="button" className="bn-release-banner-view">View Changelog</button>
        </div>
      </div>
    </div>
  );
}
