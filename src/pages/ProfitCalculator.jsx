import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import SavedRow from '../components/SavedRow';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/ProfitCalculator.css';

const SLUG = 'profit-calculator';
const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function ProfitCalculator() {
  const [revenue, setRevenue] = useState(500000);
  const [cogs, setCogs] = useState(200000);
  const [opEx, setOpEx] = useState(80000);
  const [otherEx, setOtherEx] = useState(20000);
  const { entries, save, remove } = useSavedCalculations(SLUG);

  const result = useMemo(() => {
    const totalCosts = Number(cogs || 0) + Number(opEx || 0) + Number(otherEx || 0);
    const netProfit = Number(revenue || 0) - totalCosts;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const costPct = revenue > 0 ? (totalCosts / revenue) * 100 : 0;
    return { totalCosts, netProfit, margin, costPct };
  }, [revenue, cogs, opEx, otherEx]);

  const getCopyText = () => `Profit Calculator\nRevenue: ${fmt(revenue)}\nTotal Costs: ${fmt(result.totalCosts)}\nNet Profit: ${fmt(result.netProfit)} (${result.margin.toFixed(1)}%)`;
  const handleSave = () => save({ revenue, cogs, opEx, otherEx, ...result });
  const loadExample = () => { setRevenue(500000); setCogs(200000); setOpEx(80000); setOtherEx(20000); };

  return (
    <ToolPageShell slug={SLUG} title="Profit Calculator" description="Calculate your profit, costs and profit margin instantly." getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Your Details</h3>
          <div className="bn-input-group">
            <label>Total Revenue (Sales)</label>
            <input type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Cost of Goods Sold (COGS)</label>
            <input type="number" value={cogs} onChange={(e) => setCogs(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Operating Expenses</label>
            <input type="number" value={opEx} onChange={(e) => setOpEx(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Other Expenses</label>
            <input type="number" value={otherEx} onChange={(e) => setOtherEx(e.target.value)} />
          </div>
          <button type="button" className="bn-calc-quick-btn" onClick={loadExample}>Load Example</button>
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Your Profit Summary</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">Net Profit</div>
              <div className="bn-result-value">{fmt(result.netProfit)}</div>
            </div>
            <div className="bn-result-row"><span>Total Revenue</span><span>{fmt(revenue)}</span></div>
            <div className="bn-result-row"><span>Total Costs</span><span>{fmt(result.totalCosts)}</span></div>
            <div className="bn-result-row"><span>Profit Margin</span><span>{result.margin.toFixed(1)}%</span></div>
            <div className="bn-result-row"><span>Cost Percentage</span><span>{result.costPct.toFixed(1)}%</span></div>

            <div className="bn-profit-donut" style={{ '--pct': Math.max(0, Math.min(100, result.margin)) }}>
              <div className="bn-profit-donut-inner">
                <span>{result.margin.toFixed(0)}%</span>
                <small>Net Profit</small>
              </div>
            </div>

            <div className="bn-calc-note">
              <strong>What do these numbers mean?</strong>
              <ul>
                <li><strong>Net Profit</strong> is what remains after all costs and expenses.</li>
                <li><strong>Profit Margin</strong> shows how much profit you make from your revenue.</li>
                <li>The higher the margin, the healthier your business.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Saved Calculations</h3>
          {entries.map((e) => (
            <SavedRow
              key={e.id}
              label={`Revenue ${fmt(e.data.revenue)}`}
              value={`Net ${fmt(e.data.netProfit)}`}
              copyText={`${`Revenue ${fmt(e.data.revenue)}`} — ${`Net ${fmt(e.data.netProfit)}`}`}
              onDelete={() => remove(e.id)}
            />
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
