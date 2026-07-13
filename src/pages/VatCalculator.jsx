import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/VatCalculator.css';

const SLUG = 'vat-calculator';
const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function VatCalculator() {
  const [vatRate, setVatRate] = useState(7.5);
  const [mode, setMode] = useState('exclusive'); // 'exclusive' = add VAT, 'inclusive' = extract VAT
  const [amount, setAmount] = useState(100000);
  const { entries, save, remove } = useSavedCalculations(SLUG);

  const result = useMemo(() => {
    const rate = Number(vatRate || 0) / 100;
    const amt = Number(amount || 0);
    if (mode === 'exclusive') {
      const vatAmount = amt * rate;
      return { exclusive: amt, vatAmount, inclusive: amt + vatAmount };
    }
    const exclusive = amt / (1 + rate);
    const vatAmount = amt - exclusive;
    return { exclusive, vatAmount, inclusive: amt };
  }, [amount, vatRate, mode]);

  const getCopyText = () => `VAT Calculator\nExclusive: ${fmt(result.exclusive)}\nVAT (${vatRate}%): ${fmt(result.vatAmount)}\nInclusive: ${fmt(result.inclusive)}`;
  const handleSave = () => save({ amount, vatRate, mode, ...result });

  const quickExamples = [10000, 50000, 100000];

  return (
    <ToolPageShell slug={SLUG} title="VAT Calculator" description="Calculate VAT amount, exclusive and inclusive values easily." getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Details</h3>
          <div className="bn-input-group">
            <label>Select VAT Rate</label>
            <select value={vatRate} onChange={(e) => setVatRate(e.target.value)}>
              <option value={7.5}>7.5%</option>
              <option value={5}>5%</option>
              <option value={15}>15%</option>
              <option value={20}>20%</option>
            </select>
          </div>
          <div className="bn-input-group">
            <label>Calculation Type</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="exclusive">Add VAT to Amount</option>
              <option value="inclusive">Include VAT in Amount</option>
            </select>
          </div>
          <div className="bn-input-group">
            <label>{mode === 'exclusive' ? 'Amount Before VAT (₦)' : 'Total Amount (₦)'}</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className="bn-calc-breakdown-title">Quick Examples</div>
          <div className="bn-calc-quick-row">
            {quickExamples.map((v) => (
              <button key={v} type="button" className="bn-calc-quick-btn" onClick={() => { setAmount(v); setMode('exclusive'); }}>
                {fmt(v)} with {vatRate}% VAT
              </button>
            ))}
          </div>
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Calculation Result</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">VAT Amount</div>
              <div className="bn-result-value">{fmt(result.vatAmount)}</div>
            </div>
            <div className="bn-result-row"><span>Exclusive Amount (Before VAT)</span><span>{fmt(result.exclusive)}</span></div>
            <div className="bn-result-row"><span>VAT Amount ({vatRate}%)</span><span>{fmt(result.vatAmount)}</span></div>
            <div className="bn-result-row"><span>Inclusive Amount (After VAT)</span><span>{fmt(result.inclusive)}</span></div>

            <div className="bn-calc-note">
              <strong>What does this mean?</strong> The total amount of {fmt(result.inclusive)} includes VAT of {fmt(result.vatAmount)}. The original price before VAT was {fmt(result.exclusive)}.
            </div>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Saved Calculations</h3>
          {entries.map((e) => (
            <div key={e.id} className="bn-saved-row">
              <span>{fmt(e.data.amount)} @ {e.data.vatRate}%</span>
              <span>VAT {fmt(e.data.vatAmount)}</span>
              <button onClick={() => remove(e.id)} aria-label="Delete"><i className="fa-solid fa-trash" /></button>
            </div>
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
