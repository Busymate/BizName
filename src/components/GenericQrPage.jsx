import { useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import ToolPageShell from './ToolPageShell';
import '../styles/GenericQr.css';

/**
 * Config-driven QR/barcode page. Renders entirely client-side using the
 * `qrcode` and `jsbarcode` libraries drawn to a <canvas> — no dependency
 * on a third-party image API. The previous version relied on free public
 * services (api.qrserver.com / barcodeapi.org); if either went down, was
 * rate-limited, or got blocked by an ad-blocker/privacy extension (common
 * for random third-party image domains), every tool in this section broke
 * at once with no fallback. Generating locally removes that single point
 * of failure entirely and also works instantly with no network round trip.
 *
 * buildPayload(values): => string used as the QR/barcode data
 */
export default function GenericQrPage({ slug, title, description, fields, buildPayload, kind = 'qr' }) {
  const initial = Object.fromEntries(fields.map((f) => [f.key, f.default]));
  const [values, setValues] = useState(initial);
  const [renderError, setRenderError] = useState('');
  const canvasRef = useRef(null);

  const update = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));
  const payload = useMemo(() => buildPayload(values), [values]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!payload || !canvasRef.current) return;
    setRenderError('');
    try {
      if (kind === 'qr') {
        QRCode.toCanvas(canvasRef.current, payload, { width: 280, margin: 1 }, (err) => {
          if (err) setRenderError('Could not generate a QR code for this input.');
        });
      } else {
        JsBarcode(canvasRef.current, payload, { format: 'CODE128', width: 2, height: 100, displayValue: true });
      }
    } catch {
      setRenderError('This value contains characters that cannot be encoded as a barcode.');
    }
  }, [payload, kind]);

  const getCopyText = () => payload;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `${slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ToolPageShell slug={slug} title={title} description={description} getCopyText={getCopyText} onDownload={handleDownload} resultSelector=".bn-qr-preview">
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
            {!payload && <p className="bn-qr-placeholder">Fill in the details to generate a preview.</p>}
            <canvas ref={canvasRef} style={{ display: payload ? 'block' : 'none', maxWidth: '100%' }} />
          </div>
          {renderError && <p className="bn-qr-download-note">{renderError}</p>}
        </div>
      </div>
    </ToolPageShell>
  );
}
