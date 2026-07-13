import { useEffect, useState } from 'react';
import SEO from './SEO';
import Button from './Button';
import AdSlot from './AdSlot';
import useFavorites from '../hooks/useFavorites';
import useRecentTools from '../hooks/useRecentTools';
import tools from '../data/tools';
import { Link } from 'react-router-dom';
import '../styles/ToolPageShell.css';

/**
 * Wraps every tool page with the shared chrome required by the spec:
 * title, description, favorite toggle, save/print/copy/share actions,
 * and a "Recently Used" strip. `getShareText` and `getCopyText` let each
 * tool supply its own result text; `onSave` lets each tool persist its
 * own calculation shape via useSavedCalculations.
 */
export default function ToolPageShell({
  slug,
  title,
  description,
  children,
  getCopyText,
  onSave,
  printTargetId,
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { recent, addRecent } = useRecentTools();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    addRecent(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fav = isFavorite(slug);

  const handleCopy = async () => {
    const text = getCopyText ? getCopyText() : `${title} — ${description}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${title} | BizName`,
      text: description,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled share — ignore */
      }
    } else {
      handleCopy();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const recentTools = recent
    .filter((s) => s !== slug)
    .map((s) => tools.find((t) => t.slug === s))
    .filter(Boolean)
    .slice(0, 5);

  return (
    <div className="bn-tool-page">
      <SEO
        title={title}
        description={description}
        path={`/${slug}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: title,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />

      <div className="bn-tool-header">
        <div className="bn-tool-header-text">
          <div className="bn-breadcrumb">
            <Link to="/">Home</Link> <i className="fa-solid fa-chevron-right" /> <Link to="/tools">Tools</Link> <i className="fa-solid fa-chevron-right" /> <span>{title}</span>
          </div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button
          className={`bn-tool-fav-lg ${fav ? 'is-fav' : ''}`}
          onClick={() => toggleFavorite(slug)}
          type="button"
        >
          <i className={`fa-${fav ? 'solid' : 'regular'} fa-star`} />
          {fav ? 'Favorited' : 'Add to Favorites'}
        </button>
      </div>

      <div id={printTargetId || 'bn-tool-print-area'}>{children}</div>

      <div className="bn-tool-actions">
        <Button variant="primary" icon="fa-floppy-disk" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Result'}
        </Button>
        <Button variant="outline" icon="fa-print" onClick={handlePrint}>Print</Button>
        <Button variant="outline" icon="fa-copy" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button variant="outline" icon="fa-share-nodes" onClick={handleShare}>Share</Button>
      </div>

      <AdSlot type="in-content" />

      {recentTools.length > 0 && (
        <div className="bn-recent-tools">
          <h3>Recently Used</h3>
          <div className="bn-recent-tools-row">
            {recentTools.map((t) => (
              <Link key={t.slug} to={`/${t.slug}`} className="bn-recent-tool-chip">
                <i className={`fa-solid fa-${t.icon}`} /> {t.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
