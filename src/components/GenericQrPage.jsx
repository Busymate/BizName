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

  const update = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));
  const payload = useMemo(() => buildPayload(values), [values]); // eslint-disable-line react-hooks/exhaustive-deps

  const imageUrl =
    kind === 'qr'
      ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(payload)}`
      : `https://barcodeapi.org/api/128/${encodeURIComponent(payload)}`;

  const getCopyText = () => payload;
  const handlePrint = () => window.print();

  return (
    <ToolPageShell slug={slug} title={title} description={description} getCopyText={getCopyText}>
      <div className="bn-qr-layout">
        <div className="bn-qr-form bn-card">
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
              <Button as="a" href={imageUrl} download variant="primary" icon="fa-download">Download PNG</Button>
              <Button variant="outline" icon="fa-print" onClick={handlePrint}>Print</Button>
            </div>
          )}
        </div>
      </div>
    </ToolPageShell>
  );
}
