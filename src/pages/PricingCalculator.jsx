import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/PricingCalculator.css';

const SLUG = 'pricing-calculator';
const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function PricingCalculator() {
  const [cost, setCost] = useState(20000);
  const [desiredProfit, setDesiredProfit] = useState(30);
  const [overhead, setOverhead] = useState(5000);
  const [tax, setTax] = useState(7.5);
  const { entries, save, remove } = useSavedCalculations(SLUG);

  const result = useMemo(() => {
    const c = Number(cost || 0) + Number(overhead || 0);
    const profit = (c * Number(desiredProfit || 0)) / 100;
    const preTax = c + profit;
    const taxAmount = (preTax * Number(tax || 0)) / 100;
    const sellingPrice = preTax + taxAmount;
    const earnPct = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
    return { profit, sellingPrice, taxAmount, earnPct };
  }, [cost, overhead, desiredProfit, tax]);

  const scenarios = [10, 20, 30, 40].map((p) => {
    const c = Number(cost || 0) + Number(overhead || 0);
    const profit = (c * p) / 100;
    const preTax = c + profit;
    const taxAmount = (preTax * Number(tax || 0)) / 100;
    return { profit: p, price: preTax + taxAmount };
  });

  const getCopyText = () => `Pricing Calculator\nCost: ${fmt(cost)}\nSelling Price: ${fmt(result.sellingPrice)}\nProfit: ${fmt(result.profit)}`;
  const handleSave = () => save({ cost, desiredProfit, overhead, tax, ...result });

  return (
    <ToolPageShell slug={SLUG} title="Pricing Calculator" description="Calculate the perfect selling price for your product or service." getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Details</h3>
          <div className="bn-input-group">
            <label>Cost of Product/Service (₦)</label>
            <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Desired Profit (%)</label>
            <input type="number" value={desiredProfit} onChange={(e) => setDesiredProfit(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Overhead Expenses (₦)</label>
            <input type="number" value={overhead} onChange={(e) => setOverhead(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Tax (%) (Optional)</label>
            <input type="number" value={tax} onChange={(e) => setTax(e.target.value)} />
          </div>

          <div className="bn-calc-note">
            <strong>Pricing Suggestions</strong>
            <ul>
              <li>Know your costs well before setting a price.</li>
              <li>Check your competitors but don't always follow them.</li>
              <li>Focus on the value you provide, not just the price.</li>
              <li>Review and adjust your prices regularly.</li>
            </ul>
          </div>
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Recommended Price</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">Selling Price</div>
              <div className="bn-result-value">{fmt(result.sellingPrice)}</div>
            </div>
            <div className="bn-result-row"><span>Cost Price</span><span>{fmt(cost)}</span></div>
            <div className="bn-result-row"><span>Profit ({desiredProfit}%)</span><span>{fmt(result.profit)}</span></div>
            <div className="bn-result-row"><span>Overhead Expenses</span><span>{fmt(overhead)}</span></div>
            <div className="bn-result-row"><span>Tax ({tax}%)</span><span>{fmt(result.taxAmount)}</span></div>
            <div className="bn-savings-badge">
              <i className="fa-solid fa-sack-dollar" /> You Earn (Profit) {fmt(result.profit)} ({result.earnPct.toFixed(1)}% of Selling Price)
            </div>
          </div>

          <div className="bn-card">
            <h3>Quick Scenarios</h3>
            <table className="bn-calc-table">
              <thead><tr><th>Profit</th><th>Selling Price</th></tr></thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.profit} className={s.profit === Number(desiredProfit) ? 'bn-calc-row-active' : ''}>
                    <td>{s.profit}% Profit</td>
                    <td>{fmt(s.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Saved Calculations</h3>
          {entries.map((e) => (
            <div key={e.id} className="bn-saved-row">
              <span>Cost {fmt(e.data.cost)}</span>
              <span>Price {fmt(e.data.sellingPrice)}</span>
              <button onClick={() => remove(e.id)} aria-label="Delete"><i className="fa-solid fa-trash" /></button>
            </div>
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
