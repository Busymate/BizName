import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import ToolCard from '../components/ToolCard';
import tools from '../data/tools';
import useFavoriteTools from '../hooks/useFavoriteTools';
import '../styles/Tools.css';
import '../styles/Auth.css';
import '../styles/BusinessSuite.css';
import '../styles/Dashboard.css';

// The star toggle on every ToolCard (see components/ToolCard.jsx) writes
// to the same useFavoriteTools localStorage list this page reads —
// starring a tool from /tools or from the Dashboard's Favorite Tools
// grid shows up here immediately, and un-starring here removes it from
// both of those places too.
export default function Favorites() {
  const { favorites } = useFavoriteTools();
  const favoriteTools = favorites.map((slug) => tools.find((t) => t.slug === slug)).filter(Boolean);

  return (
    <div className="bn-container" style={{ maxWidth: 1100 }}>
      <SEO title="Favorite Tools" description="Your starred BizName tools, all in one place." path="/favorites" />

      <div className="bn-dashboard-topbar" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1><i className="fa-solid fa-heart" style={{ color: '#f59e0b', marginRight: '0.5rem' }} /> Favorite Tools</h1>
          <p>Tools you've starred for quick access — star any tool card to add it here.</p>
        </div>
      </div>

      {favoriteTools.length === 0 ? (
        <div className="bn-dashboard-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <i className="fa-regular fa-star" style={{ fontSize: '2rem', color: 'var(--bn-text-secondary)', marginBottom: '0.75rem', display: 'block' }} />
          <h3 style={{ margin: '0 0 0.5rem' }}>No favorites yet</h3>
          <p className="bn-muted-text" style={{ marginBottom: '1.25rem' }}>
            Click the star on any tool to pin it here for quick access next time.
          </p>
          <Link to="/tools" className="bn-auth-submit" style={{ display: 'inline-block', maxWidth: 220, margin: '0 auto' }}>Browse All Tools</Link>
        </div>
      ) : (
        <div className="bn-grid bn-grid-3">
          {favoriteTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
