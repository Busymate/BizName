import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import '../styles/CurrencyCalculator.css';

const SLUG = 'currency-calculator';

// Static illustrative rates (units of NGN per 1 unit of currency). In a
// production build, swap RATES for a live fetch to a free FX API — this
// keeps the tool fully functional offline with no backend of our own.
const RATES = {
  USD: 1528.5,
  EUR: 1655.2,
  GBP: 1932.8,
  NGN: 1,
  CAD: 1105.4,
  AUD: 990.7,
  JPY: 10.2,
};

export default function CurrencyCalculator() {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('NGN');
  const [amount, setAmount] = useState(100);

  const result = useMemo(() => {
    const inNgn = Number(amount || 0) * RATES[from];
    const converted = inNgn / RATES[to];
    const rate = RATES[from] / RATES[to];
    return { converted, rate };
  }, [from, to, amount]);

  const swap = () => { setFrom(to); setTo(from); };
  const getCopyText = () => `${amount} ${from} = ${result.converted.toFixed(2)} ${to}`;

  return (
    <ToolPageShell slug={SLUG} title="Currency Converter" description="Convert between currencies using reference exchange rates." getCopyText={getCopyText}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Details</h3>
          <div className="bn-input-group">
            <label>From Currency</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              {Object.keys(RATES).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="button" className="bn-swap-btn" onClick={swap}><i className="fa-solid fa-arrows-rotate" /> Swap</button>
          <div className="bn-input-group">
            <label>To Currency</label>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              {Object.keys(RATES).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="bn-input-group">
            <label>Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Conversion Result</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">{amount} {from} =</div>
              <div className="bn-result-value">{result.converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}</div>
            </div>
            <div className="bn-result-row"><span>Exchange Rate</span><span>1 {from} = {result.rate.toFixed(4)} {to}</span></div>
            <div className="bn-calc-note">Rates shown are reference values for estimation. Always verify live rates before making financial transactions.</div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
