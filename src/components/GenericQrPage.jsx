import { useMemo, useState } from 'react';
import ToolPageShell from './ToolPageShell';
import Button from './Button';
import '../styles/GenericQr.css';

/**
 * Config-driven QR/barcode page. Image rendering uses the free, no-key
 * public QR Server API (api.qrserver.com) and a free public barcode
 * renderer — no paid service, no backend of our own. If you'd rather
 * generate codes fully offline, swap the <img src> for a client-side
 * library such as `qrcode` (npm) and draw to a <canvas>.
 *
 * buildPayload(values): => string used as the QR/barcode data
 */
export default function GenericQrPage({ slug, title, description, fields, buildPayload, kind = 'qr' }) {
  const initial = Object.fromEntries(fields.map((f) => [f.key, f.default]));
  const [values, setValues] = useState(initial);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const update = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));
  const payload = useMemo(() => buildPayload(values), [values]); // eslint-disable-line react-hooks/exhaustive-deps

  const imageUrl =
    kind === 'qr'
      ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(payload)}`
      : `https://barcodeapi.org/api/128/${encodeURIComponent(payload)}`;

  const getCopyText = () => payload;
  const handlePrint = () => window.print();

  // The HTML `download` attribute is silently ignored by most browsers
  // for cross-origin URLs (like this image API), so clicking it just
  // opens the image instead of saving it. Fetching the image as a blob
  // and downloading that blob URL works reliably on desktop and mobile
  // (including saving to a phone's Photos/Gallery via the browser's own
  // download handling).
  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(false);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fetch/CORS failed — fall back to opening the image directly so
      // the person can still long-press/right-click to save it manually.
      setDownloadError(true);
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolPageShell slug={slug} title={title} description={description} getCopyText={getCopyText}>
      <div className="bn-qr-layout">
        <div className="bn-qr-form bn-card bn-print-hide">
          <h3>Enter Details</h3>
          {fields.map((f) => (
            <div className="bn-input-group" key={f.key}>
              <label>{f.label}</label>
              {f.type === 'select' ? (
                <select value={values[f.key]} onChange={(e) => update(f.key, e.target.value)}>
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input value={values[f.key]} onChange={(e) => update(f.key, e.target.value)} placeholder={f.placeholder} />
              )}
            </div>
          ))}
        </div>

        <div className="bn-qr-preview bn-card">
          <h3>Preview <span className="bn-live-badge">Live</span></h3>
          <div className="bn-qr-image-wrap">
            {payload ? <img src={imageUrl} alt={`${title} preview`} /> : <p className="bn-qr-placeholder">Fill in the details to generate a preview.</p>}
          </div>
          {payload && (
            <div className="bn-qr-actions">
              <Button variant="primary" icon="fa-download" onClick={handleDownload} disabled={downloading}>
                {downloading ? 'Downloading…' : 'Download PNG'}
              </Button>
              <Button variant="outline" icon="fa-print" onClick={handlePrint}>Print</Button>
            </div>
          )}
          {downloadError && (
            <p className="bn-qr-download-note">
              Your browser blocked the direct download, so we opened the image in a new tab instead — press and hold (or right-click) it to save to your device.
            </p>
          )}
        </div>
      </div>
    </ToolPageShell>
  );
}
