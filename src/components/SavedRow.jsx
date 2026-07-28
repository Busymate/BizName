import { useState } from 'react';
import '../styles/SavedRow.css';

/**
 * One row inside a "Saved Calculations" / "Recent X" list. Standardizes
 * the copy + delete actions so every tool page behaves the same way
 * instead of each page reimplementing clipboard logic separately.
 *
 * label: left-side text (e.g. "Revenue ₦500,000")
 * value: right-side highlighted text (e.g. "Net ₦200,000")
 * copyText: full text copied to the clipboard when the copy button is pressed
 * onDelete: called when the trash button is pressed
 */
export default function SavedRow({ label, value, copyText, onDelete }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore, nothing else to fall back to here
    }
  };

  return (
    <div className="bn-saved-row">
      <span>{label}</span>
      {value && <span>{value}</span>}
      <div className="bn-saved-row-actions">
        <button onClick={handleCopy} aria-label="Copy" type="button" className={copied ? 'is-copied' : ''}>
          <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} />
        </button>
        <button onClick={onDelete} aria-label="Delete" type="button" className="bn-saved-row-delete">
          <i className="fa-solid fa-trash" />
        </button>
      </div>
    </div>
  );
}
