import { useEffect, useRef, useState } from 'react';
import SEO from './SEO';
import Button from './Button';
import AdSlot from './AdSlot';
import ToolCard from './ToolCard';
import useRecentTools from '../hooks/useRecentTools';
import tools, { getToolBySlug } from '../data/tools';
import { Link } from 'react-router-dom';
import '../styles/ToolPageShell.css';
import '../styles/Faq.css';

// Every tool is free and every form on the site follows the same
// "fill in → see live result" shape, so a single, honest default is
// used everywhere rather than fabricating a made-up per-tool history.
// Pass `version` / `estimatedTime` on a specific tool page if it ever
// needs to say something more specific.
const DEFAULT_VERSION = 'v1.0.0';
const DEFAULT_ESTIMATED_TIME = 'Takes less than 2 minutes.';

function defaultHowItWorks(title) {
  return [
    `Fill in the ${title} form — every field has a label, placeholder and helper text.`,
    'Watch your result update instantly in the live preview.',
    'Save, download, print or share your result — or hit Clear to start over.',
  ];
}

function defaultFaq(title) {
  return [
    { q: `Is ${title} free to use?`, a: `Yes — ${title} is completely free on BizName, with no sign-up required to try it out.` },
    { q: 'Is my data saved automatically?', a: 'No. Nothing is saved until you press "Save Result". Once saved (free account), it appears instantly in Saved Items and your dashboard history — no page refresh needed.' },
  ];
}

/**
 * Wraps every tool page with the shared chrome every tool must have:
 * icon + title + description + version/time badges, a "How it Works"
 * section, the tool's own form/result content, a consistent
 * Save → Download → Print → Copy → Share → Clear action row, a Related
 * Tools grid, a per-tool FAQ, a sponsored ad slot, and a "Recently Used"
 * strip. `getCopyText` lets each tool supply its own result text;
 * `onSave` lets each tool persist its own calculation shape to Saved
 * Items via useSavedCalculations. `onDownload` / `onClear` are optional —
 * sensible defaults (download the result as a text file; reload the page
 * to reset the form) are used when a tool doesn't provide its own.
 */
export default function ToolPageShell({
  slug,
  title,
  description,
  children,
  getCopyText,
  onSave,
  printTargetId,
  resultSelector,
  version = DEFAULT_VERSION,
  estimatedTime = DEFAULT_ESTIMATED_TIME,
  howItWorks,
  faq,
  onDownload,
  onClear,
}) {
  const { recent, addRecent } = useRecentTools();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const shareMenuRef = useRef(null);
  const tool = getToolBySlug(slug);
  const iconPrefix = tool?.iconPrefix || 'fa-solid';
  const steps = howItWorks && howItWorks.length ? howItWorks : defaultHowItWorks(title);
  const faqItems = faq && faq.length ? faq : defaultFaq(title);
  const relatedTools = tool
    ? tools.filter((t) => t.category === tool.category && t.slug !== slug).slice(0, 4)
    : [];

  useEffect(() => {
    addRecent(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!shareOpen) return;
    const handleClickOutside = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [shareOpen]);

  const resultText = getCopyText ? getCopyText() : `${title} — ${description}`;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Default Download: every tool has a text result even before it has a
  // PDF/PNG export of its own, so this always gives a real, working
  // download instead of a dead button. A tool with a richer export (the
  // QR generators' PNG, a future invoice PDF) just passes its own
  // `onDownload` and this default is skipped entirely.
  const handleDownload = () => {
    if (onDownload) return onDownload();
    const blob = new Blob([resultText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}-result.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    flashFeedback('Downloaded!');
  };

  // Default Clear: reloading resets every piece of local state on the
  // page in one universal, zero-per-tool-code move. A tool that wants a
  // softer in-place reset (no full reload) can pass its own `onClear`.
  const handleClear = () => {
    if (onClear) return onClear();
    if (window.confirm('Clear everything you\u2019ve entered on this page?')) {
      window.location.reload();
    }
  };

  // Prints ONLY the result/output element (e.g. the invoice preview, or
  // a calculator's result card) instead of the whole page. Works by
  // injecting a scoped @media print rule that hides everything except
  // `resultSelector` for the duration of the print, then cleaning up
  // afterward — no new window/tab, no popup-blocker issues, and no
  // per-browser print-preview quirks from cloning the node elsewhere.
  const handlePrintResult = () => {
    if (!resultSelector) return handlePrint();
    const style = document.createElement('style');
    style.setAttribute('data-bn-print-result', 'true');
    // Hides every element that is neither the target, an ancestor of the
    // target (kept so the DOM path down to it still renders), nor a
    // descendant of it — the standard "isolate one subtree for print"
    // trick. Deliberately NOT "hide everything, then display:revert the
    // target" — revert resets each descendant to the browser's default
    // display value (e.g. a flex row would revert to block), which would
    // visibly break the result's own layout. This keeps every element's
    // original CSS untouched and just removes the surrounding chrome.
    // Relies on :has() (broadly supported in current browsers); if a
    // browser doesn't support it, this whole rule is simply ignored and
    // "Print Result" falls back to printing the full page — degraded,
    // not broken.
    style.textContent = `
      @media print {
        body.bn-printing-result-only *:not(${resultSelector}):not(${resultSelector} *):not(:has(${resultSelector})) {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('bn-printing-result-only');

    const cleanup = () => {
      document.body.classList.remove('bn-printing-result-only');
      style.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    // Safety net: some browsers (older Safari) don't reliably fire
    // afterprint — clean up regardless after a few seconds.
    setTimeout(cleanup, 3000);
  };

  const flashFeedback = (msg, duration = 2000) => {
    setShareFeedback(msg);
    setTimeout(() => setShareFeedback(''), duration);
  };

  // Option 1: share the actual result/outcome (what the tool produced).
  const handleShareResult = async () => {
    setShareOpen(false);
    const shareData = { title: `${title} | BizName`, text: resultText, url: pageUrl };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled — no error state needed */
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${resultText}\n\n${pageUrl}`);
        flashFeedback('Result copied to clipboard!');
      } catch {
        /* clipboard unavailable — silently ignore */
      }
    }
  };

  // Option 2: share just the link to this tool, no result data attached.
  const handleShareLink = async () => {
    setShareOpen(false);
    const shareData = { title: `${title} | BizName`, text: description, url: pageUrl };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled — no error state needed */
      }
    } else {
      try {
        await navigator.clipboard.writeText(pageUrl);
        flashFeedback('Link copied to clipboard!');
      } catch {
        /* clipboard unavailable — silently ignore */
      }
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    const result = await onSave();
    if (result?.ok === false) {
      if (result.reason === 'login_required') {
        flashFeedback('Log in (free) to save your results — see the Sign Up button in the menu.', 4000);
      } else {
        flashFeedback('Could not save right now — please try again.');
      }
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
          <div className="bn-tool-header-title-row">
            {tool && (
              <div className="bn-tool-header-icon">
                {tool.iconImage ? <img src={tool.iconImage} alt="" /> : <i className={`${iconPrefix} fa-${tool.icon}`} />}
              </div>
            )}
            <h1>{title}</h1>
          </div>
          <p>{description}</p>
          <div className="bn-tool-header-meta">
            <span className="bn-tool-meta-badge"><i className="fa-solid fa-code-branch" /> Updated in {version}</span>
            <span className="bn-tool-meta-badge"><i className="fa-regular fa-clock" /> {estimatedTime}</span>
          </div>
        </div>
      </div>

      <AdSlot type="banner" label="Advertisement" />

      {steps.length > 0 && (
        <div className="bn-how-it-works bn-card">
          <h3>How it Works</h3>
          <ol>
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      <div id={printTargetId || 'bn-tool-print-area'}>{children}</div>

      <div className="bn-tool-actions">
        <Button variant="primary" icon="fa-floppy-disk" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Result'}
        </Button>
        <Button variant="outline" icon="fa-download" onClick={handleDownload}>Download</Button>
        <Button variant="outline" icon="fa-print" onClick={handlePrint}>Print</Button>
        {resultSelector && (
          <Button variant="outline" icon="fa-file-arrow-down" onClick={handlePrintResult}>Print Result</Button>
        )}
        <Button variant="outline" icon="fa-copy" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <div className="bn-share-menu" ref={shareMenuRef}>
          <Button variant="outline" icon="fa-share-nodes" onClick={() => setShareOpen((o) => !o)}>
            Share
          </Button>
          {shareOpen && (
            <div className="bn-share-dropdown">
              <button type="button" onClick={handleShareResult}>
                <i className="fa-solid fa-chart-simple" />
                <span>
                  <strong>Share Result</strong>
                  <small>Send this tool's outcome plus a link</small>
                </span>
              </button>
              <button type="button" onClick={handleShareLink}>
                <i className="fa-solid fa-link" />
                <span>
                  <strong>Share Link Only</strong>
                  <small>Just the page link, no result data</small>
                </span>
              </button>
            </div>
          )}
          {shareFeedback && <div className="bn-share-feedback">{shareFeedback}</div>}
        </div>
        <Button variant="ghost" icon="fa-rotate-left" onClick={handleClear}>Clear</Button>
      </div>

      {relatedTools.length > 0 && (
        <div className="bn-related-tools">
          <h3>Related Tools</h3>
          <div className="bn-related-tools-grid">
            {relatedTools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </div>
      )}

      {faqItems.length > 0 && (
        <div className="bn-tool-faq">
          <h3>Frequently Asked Questions</h3>
          <div className="bn-faq-list">
            {faqItems.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div className={`bn-faq-item ${isOpen ? 'is-open' : ''}`} key={item.q}>
                  <button
                    type="button"
                    className="bn-faq-question"
                    onClick={() => setOpenFaq((cur) => (cur === i ? -1 : i))}
                    aria-expanded={isOpen}
                  >
                    <span>{item.q}</span>
                    <i className="fa-solid fa-chevron-down bn-faq-icon" />
                  </button>
                  <div className="bn-faq-answer">
                    <div className="bn-faq-answer-inner">
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
