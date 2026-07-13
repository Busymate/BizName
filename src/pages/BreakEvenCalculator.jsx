import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/BreakEvenCalculator.css';

const SLUG = 'break-even-calculator';
const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState(150000);
  const [sellingPrice, setSellingPrice] = useState(5000);
  const [variableCost, setVariableCost] = useState(2000);
  const [otherExpenses, setOtherExpenses] = useState(10000);
  const { entries, save, remove } = useSavedCalculations(SLUG);

  const result = useMemo(() => {
    const fc = Number(fixedCosts || 0) + Number(otherExpenses || 0);
    const sp = Number(sellingPrice || 0);
    const vc = Number(variableCost || 0);
    const contribution = sp - vc;
    const breakEvenUnits = contribution > 0 ? Math.ceil(fc / contribution) : 0;
    const breakEvenSales = breakEvenUnits * sp;
    const marginOfSafetyUnits = breakEvenUnits; // baseline reference
    return { fc, contribution, breakEvenUnits, breakEvenSales, marginOfSafetyUnits };
  }, [fixedCosts, sellingPrice, variableCost, otherExpenses]);

  const getCopyText = () => `Break-even Calculator\nBreak-even Units: ${result.breakEvenUnits}\nBreak-even Sales: ${fmt(result.breakEvenSales)}`;
  const handleSave = () => save({ fixedCosts, sellingPrice, variableCost, otherExpenses, ...result });

  return (
    <ToolPageShell slug={SLUG} title="Break-even Calculator" description="Calculate your break-even point and understand your business better." getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Your Details</h3>
          <div className="bn-input-group">
            <label>Fixed Costs (₦)</label>
            <input type="number" value={fixedCosts} onChange={(e) => setFixedCosts(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Selling Price per Unit (₦)</label>
            <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Variable Cost per Unit (₦)</label>
            <input type="number" value={variableCost} onChange={(e) => setVariableCost(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Other Expenses (₦)</label>
            <input type="number" value={otherExpenses} onChange={(e) => setOtherExpenses(e.target.value)} />
          </div>

          <div className="bn-calc-note">
            <strong>Calculation Breakdown</strong>
            <p>Contribution per Unit = Selling Price − Variable Cost = {fmt(sellingPrice)} − {fmt(variableCost)} = {fmt(result.contribution)}</p>
            <p>Break-even Units = Fixed Costs / Contribution per Unit = {fmt(result.fc)} / {fmt(result.contribution)} = {result.breakEvenUnits} Units</p>
          </div>
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Break-even Summary</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">Break-even Point (Units)</div>
              <div className="bn-result-value">{result.breakEvenUnits} Units</div>
            </div>
            <div className="bn-result-row"><span>Break-even Point (Sales)</span><span>{fmt(result.breakEvenSales)}</span></div>
            <div className="bn-result-row"><span>Total Fixed Costs</span><span>{fmt(result.fc)}</span></div>
            <div className="bn-result-row"><span>Contribution per Unit</span><span>{fmt(result.contribution)}</span></div>

            <div className="bn-calc-note">
              <ul>
                <li>You need to sell {result.breakEvenUnits} units to cover all your costs.</li>
                <li>At {result.breakEvenUnits + 1} units and above, you start making profit.</li>
                <li>Use this insight to set sales targets and grow profitably.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Saved Calculations</h3>
          {entries.map((e) => (
            <div key={e.id} className="bn-saved-row">
              <span>Break-even {e.data.breakEvenUnits} units</span>
              <span>{fmt(e.data.breakEvenSales)}</span>
              <button onClick={() => remove(e.id)} aria-label="Delete"><i className="fa-solid fa-trash" /></button>
            </div>
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
