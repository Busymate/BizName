import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Button from '../components/Button';
import templates, { templateCategories } from '../data/templates';
import useLocalStorage from '../hooks/useLocalStorage';
import { KEYS } from '../utils/storage';
import '../styles/Templates.css';

export default function Templates() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [bookmarks, setBookmarks] = useLocalStorage(KEYS.BOOKMARKED_TEMPLATES, []);

  const toggleBookmark = (slug) => {
    setBookmarks((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (category !== 'All' && t.category !== category) return false;
      if (query && !`${t.name} ${t.description}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, category]);

  return (
    <div className="bn-container bn-templates-page">
      <SEO title="Business Templates" description="Professional templates to save you time and make your business look smarter." path="/templates" />

      <div className="bn-templates-header">
        <h1>Business <span className="bn-text-accent">Templates</span></h1>
        <p>Professional templates to save you time and make your business look smarter.</p>
        <div className="bn-templates-search">
          <i className="fa-solid fa-magnifying-glass" />
          <input
            type="text"
            placeholder="Search templates (e.g. invoice, receipt, business plan...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bn-template-filters">
        <button className={category === 'All' ? 'active' : ''} onClick={() => setCategory('All')}>All Templates</button>
        {templateCategories.map((c) => (
          <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <div className="bn-grid bn-grid-4">
        {filtered.map((tpl) => {
          const bookmarked = bookmarks.includes(tpl.slug);
          return (
            <div className="bn-template-card" key={tpl.slug} data-aos="fade-up">
              <button
                className={`bn-template-bookmark ${bookmarked ? 'is-active' : ''}`}
                onClick={() => toggleBookmark(tpl.slug)}
                type="button"
                aria-label="Bookmark template"
              >
                <i className={`fa-${bookmarked ? 'solid' : 'regular'} fa-star`} />
              </button>
              <div className="bn-template-thumb">
                {tpl.image ? <img src={tpl.image} alt={tpl.name} /> : <i className="fa-solid fa-file-lines" />}
              </div>
              <h4>{tpl.name}</h4>
              <p>{tpl.description}</p>
              <div className="bn-template-formats">
                {tpl.formats.map((f) => <span key={f}>{f}</span>)}
              </div>
              {tpl.toolSlug ? (
                <Button as={Link} to={`/${tpl.toolSlug}`} variant="primary" size="sm">Use Template</Button>
              ) : (
                <Button variant="outline" size="sm" disabled>Coming Soon</Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
