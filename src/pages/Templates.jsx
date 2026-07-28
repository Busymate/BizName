import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Button from '../components/Button';
import AdSlot from '../components/AdSlot';
import templates, { templateCategories } from '../data/templates';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { createSavedItem, deleteSavedItem, listSavedItemsForTool } from '../lib/savedItems';
import '../styles/Templates.css';

export default function Templates() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [bookmarks, setBookmarks] = useState([]); // [{ slug, savedItemId }]
  const { session } = useAuth();
  const [bookmarkNotice, setBookmarkNotice] = useState('');

  useEffect(() => {
    if (!session) {
      setBookmarks([]);
      return;
    }
    listSavedItemsForTool('templates', { limit: 100 })
      .then((rows) => setBookmarks(rows.map((r) => ({ slug: r.payload?.slug, savedItemId: r.id }))))
      .catch(() => setBookmarks([]));
  }, [session]);

  // BUG FIX: this used to save/unsave for anyone, logged in or not, and
  // never actually persisted anywhere durable. Bookmarks are now real
  // Supabase rows (saved_items, tool_slug = 'templates') instead of a
  // localStorage array, so they also show up in Saved Items and sync
  // across devices. (Everything is free now — no daily save cap.)
  const toggleBookmark = async (slug) => {
    const existing = bookmarks.find((b) => b.slug === slug);
    if (existing) {
      setBookmarks((prev) => prev.filter((b) => b.slug !== slug));
      try {
        await deleteSavedItem(existing.savedItemId);
      } catch {
        /* best-effort — worst case it reappears on next reload */
      }
      return;
    }
    if (!session) {
      setBookmarkNotice('Log in (free) to save templates.');
      setTimeout(() => setBookmarkNotice(''), 4000);
      return;
    }
    try {
      await api.consumeQuota('template_save');
    } catch (err) {
      setBookmarkNotice(err.message || 'Could not save this template right now — please try again.');
      setTimeout(() => setBookmarkNotice(''), 4000);
      return;
    }
    const tpl = templates.find((t) => t.slug === slug);
    try {
      const item = await createSavedItem({
        type: 'template',
        toolSlug: 'templates',
        name: tpl?.name || slug,
        payload: { slug },
      });
      setBookmarks((prev) => [...prev, { slug, savedItemId: item.id }]);
    } catch (err) {
      setBookmarkNotice(err.message || 'Could not save template right now.');
      setTimeout(() => setBookmarkNotice(''), 4000);
    }
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

      <AdSlot type="banner" label="Advertisement" />

      {bookmarkNotice && <p className="bn-newsletter-error" style={{ textAlign: 'center' }}>{bookmarkNotice}</p>}

      <div className="bn-template-filters">
        <button className={category === 'All' ? 'active' : ''} onClick={() => setCategory('All')}>All Templates</button>
        {templateCategories.map((c) => (
          <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      <div className="bn-grid bn-grid-4">
        {filtered.map((tpl) => {
          const bookmarked = bookmarks.some((b) => b.slug === tpl.slug);
          return (
            <div className="bn-template-card" key={tpl.slug} data-aos="fade-up">
              <button
                className={`bn-template-bookmark ${bookmarked ? 'is-active' : ''}`}
                onClick={() => toggleBookmark(tpl.slug)}
                type="button"
                aria-label="Save template"
              >
                <i className={`fa-${bookmarked ? 'solid' : 'regular'} fa-bookmark`} />
              </button>
              <div className="bn-template-icon-block" style={{ '--tpl-color': tpl.color }}>
                <i className={`fa-solid ${tpl.icon}`} />
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
