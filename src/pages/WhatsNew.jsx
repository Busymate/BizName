import SEO from '../components/SEO';
import AdSlot from '../components/AdSlot';
import { APP_NAME, APP_VERSION, BUILD_DATE, RELEASE_NAME, RELEASE_HISTORY } from '../config/version';
import '../styles/BusinessSuite.css';
import '../styles/WhatsNew.css';

export default function WhatsNew() {
  return (
    <div className="bn-container" style={{ maxWidth: 720, margin: '3rem auto', padding: '0 1.25rem' }}>
      <SEO title="What's New" description="See what's new in the latest BizName release." path="/whats-new" />

      <h1 style={{ marginBottom: '0.25rem' }}>What's New</h1>
      <p style={{ color: 'var(--bn-text-secondary)', marginBottom: '1.75rem' }}>
        Release notes for {APP_NAME}, newest first.
      </p>

      <AdSlot type="banner" label="Advertisement" />

      {RELEASE_HISTORY.map((release, i) => (
        <div key={release.version} className={`bn-dashboard-card bn-release-card ${i === 0 ? 'bn-release-current' : ''}`}>
          <div className="bn-release-head">
            <div>
              <h3 style={{ color: 'var(--bn-text)' }}>
                v{release.version} — {release.name}
                {i === 0 && <span className="bn-badge bn-badge-paid" style={{ marginLeft: '0.6rem' }}>Current</span>}
              </h3>
              <p className="bn-muted-text">{new Date(release.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <ul className="bn-release-notes">
            {release.notes.map((note, j) => (
              <li key={j}><i className="fa-solid fa-check" /> {note}</li>
            ))}
          </ul>
        </div>
      ))}

      <p className="bn-muted-text" style={{ marginTop: '1rem' }}>
        You're on {APP_NAME} v{APP_VERSION} ({RELEASE_NAME}), built {new Date(BUILD_DATE).toLocaleDateString()}.
      </p>
    </div>
  );
}
