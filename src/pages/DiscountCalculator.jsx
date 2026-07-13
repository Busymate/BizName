import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/DiscountCalculator.css';

const SLUG = 'discount-calculator';
const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function DiscountCalculator() {
  const [originalPrice, setOriginalPrice] = useState(10000);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(15);
  const { entries, save, remove } = useSavedCalculations(SLUG);

  const result = useMemo(() => {
    const price = Number(originalPrice || 0);
    const val = Number(discountValue || 0);
    const discountAmount = discountType === 'percentage' ? (price * val) / 100 : val;
    const finalPrice = Math.max(0, price - discountAmount);
    const pctSaved = price > 0 ? (discountAmount / price) * 100 : 0;
    return { discountAmount, finalPrice, pctSaved };
  }, [originalPrice, discountValue, discountType]);

  const getCopyText = () => `Discount Calculator\nOriginal: ${fmt(originalPrice)}\nDiscount: ${fmt(result.discountAmount)}\nFinal Price: ${fmt(result.finalPrice)}`;
  const handleSave = () => save({ originalPrice, discountType, discountValue, ...result });

  const quickPercents = [10, 20, 30, 50];

  return (
    <ToolPageShell slug={SLUG} title="Discount Calculator" description="Calculate discount amount and final price easily." getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Details</h3>
          <div className="bn-input-group">
            <label>Original Price (₦)</label>
            <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Discount Type</label>
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₦)</option>
            </select>
          </div>
          <div className="bn-input-group">
            <label>Discount {discountType === 'percentage' ? '(%)' : '(₦)'}</label>
            <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
          </div>

          <div className="bn-calc-breakdown-title">Quick Examples</div>
          <div className="bn-calc-quick-row">
            {quickPercents.map((p) => (
              <button key={p} type="button" className="bn-calc-quick-btn" onClick={() => { setDiscountType('percentage'); setDiscountValue(p); }}>
                {p}% Discount
              </button>
            ))}
          </div>
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Discount Summary</h3>
            <div className="bn-result-row"><span>Original Price</span><span>{fmt(originalPrice)}</span></div>
            <div className="bn-result-row"><span>Discount ({discountType === 'percentage' ? `${discountValue}%` : fmt(discountValue)})</span><span>-{fmt(result.discountAmount)}</span></div>
            <div className="bn-result-highlight" style={{ marginTop: '0.75rem' }}>
              <div className="bn-result-label">Final Price</div>
              <div className="bn-result-value">{fmt(result.finalPrice)}</div>
            </div>
            <div className="bn-savings-badge">
              <i className="fa-solid fa-shield-heart" /> You Save {fmt(result.discountAmount)} ({result.pctSaved.toFixed(0)}%)
            </div>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Saved Calculations</h3>
          {entries.map((e) => (
            <div key={e.id} className="bn-saved-row">
              <span>{fmt(e.data.originalPrice)} → {fmt(e.data.finalPrice)}</span>
              <span>Saved {fmt(e.data.discountAmount)}</span>
              <button onClick={() => remove(e.id)} aria-label="Delete"><i className="fa-solid fa-trash" /></button>
            </div>
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
