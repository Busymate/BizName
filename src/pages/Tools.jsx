import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import ToolCard from '../components/ToolCard';
import tools, { categories } from '../data/tools';
import useFavorites from '../hooks/useFavorites';
import useRecentTools from '../hooks/useRecentTools';
import '../styles/Tools.css';

export default function Tools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const activeCategory = searchParams.get('category') || 'All';
  const showFavoritesOnly = searchParams.get('favorites') === '1';

  const { favorites } = useFavorites();
  const { recent } = useRecentTools();

  const recentTools = recent.map((s) => tools.find((t) => t.slug === s)).filter(Boolean);

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      if (showFavoritesOnly && !favorites.includes(t.slug)) return false;
      if (activeCategory !== 'All' && t.category !== activeCategory) return false;
      if (query && !`${t.name} ${t.description}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [activeCategory, query, showFavoritesOnly, favorites]);

  const setCategory = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') params.delete('category');
    else params.set('category', cat);
    params.delete('favorites');
    setSearchParams(params);
  };

  return (
    <div className="bn-container bn-tools-page">
      <SEO title="All Business Tools" description="Powerful free tools to help you save time, calculate faster, and grow your business." path="/tools" />

      <div className="bn-tools-header">
        <h1>All Business <span className="bn-text-accent">Tools</span></h1>
        <p>Powerful free tools to help you save time, calculate faster, and grow your business.</p>
        <div className="bn-tools-search">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="Search for a tool (e.g. invoice, profit, VAT...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bn-tools-layout">
        <aside className="bn-tools-sidebar">
          <h4>Categories</h4>
          <button className={activeCategory === 'All' && !showFavoritesOnly ? 'active' : ''} onClick={() => setCategory('All')}>
            All Tools
          </button>
          {categories.map((cat) => (
            <button key={cat} className={activeCategory === cat ? 'active' : ''} onClick={() => setCategory(cat)}>
              {cat}
            </button>
          ))}
          <button
            className={showFavoritesOnly ? 'active' : ''}
            onClick={() => setSearchParams({ favorites: '1' })}
          >
            <i className="fa-solid fa-star" /> My Favorites ({favorites.length})
          </button>
        </aside>

        <div className="bn-tools-content">
          {recentTools.length > 0 && !showFavoritesOnly && (
            <div className="bn-recent-strip">
              <h4>Recently Used</h4>
              <div className="bn-recent-strip-row">
                {recentTools.map((t) => (
                  <a key={t.slug} href={`/${t.slug}`} className="bn-recent-chip">{t.name}</a>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="bn-empty-state">
              <i className="fa-solid fa-magnifying-glass" />
              <p>No tools found. Try a different search or category.</p>
            </div>
          ) : (
            <div className="bn-grid bn-grid-3">
              {filtered.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
