import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import SavedRow from '../components/SavedRow';
import useSavedCalculations from '../hooks/useSavedCalculations';
import { calculatePAYE } from '../utils/taxEngine';
import '../styles/TaxCalculator.css';

const SLUG = 'tax-calculator';
const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATES = ['Lagos', 'Abuja (FCT)', 'Rivers', 'Kano', 'Oyo', 'Other'];

export default function TaxCalculator() {
  const [annualIncome, setAnnualIncome] = useState(5000000);
  const [state, setState] = useState('Lagos');
  const [payFrequency, setPayFrequency] = useState('Monthly');
  const [includeNhf, setIncludeNhf] = useState(false);
  const [includePension, setIncludePension] = useState(false);
  const { entries, save, remove } = useSavedCalculations(SLUG);

  const result = useMemo(() => {
    const income = Number(annualIncome || 0);
    const nhf = includeNhf ? income * 0.025 : 0;
    const pension = includePension ? income * 0.075 : 0;
    const taxableIncome = Math.max(0, income - nhf - pension);
    const { totalTax, breakdown } = calculatePAYE(taxableIncome);
    const divisor = payFrequency === 'Monthly' ? 12 : payFrequency === 'Weekly' ? 52 : 1;
    const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
    return { taxableIncome, totalTax, breakdown, monthlyTax: totalTax / divisor, effectiveRate };
  }, [annualIncome, includeNhf, includePension, payFrequency]);

  const getCopyText = () => `Tax Calculator\nAnnual Income: ${fmt(annualIncome)}\nTotal Tax: ${fmt(result.totalTax)}\nEffective Rate: ${result.effectiveRate.toFixed(2)}%`;
  const handleSave = () => save({ annualIncome, state, payFrequency, ...result, breakdown: undefined });

  return (
    <ToolPageShell slug={SLUG} title="Tax Calculator" description="Calculate your income tax (PAYE) quickly and accurately." getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Details</h3>
          <div className="bn-input-group">
            <label>Annual Income (₦)</label>
            <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>State of Residence</label>
            <select value={state} onChange={(e) => setState(e.target.value)}>
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="bn-input-group">
            <label>Pay Frequency</label>
            <select value={payFrequency} onChange={(e) => setPayFrequency(e.target.value)}>
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Annually</option>
            </select>
          </div>
          <label className="bn-checkbox-row">
            <input type="checkbox" checked={includeNhf} onChange={(e) => setIncludeNhf(e.target.checked)} /> Include NHF (2.5%)
          </label>
          <label className="bn-checkbox-row">
            <input type="checkbox" checked={includePension} onChange={(e) => setIncludePension(e.target.checked)} /> Include Pension (7.5%)
          </label>
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Tax Summary</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">Total Tax (Annual)</div>
              <div className="bn-result-value">{fmt(result.totalTax)}</div>
            </div>
            <div className="bn-result-row"><span>Total Tax ({payFrequency})</span><span>{fmt(result.monthlyTax)}</span></div>
            <div className="bn-result-row"><span>Effective Tax Rate</span><span>{result.effectiveRate.toFixed(2)}%</span></div>
            <div className="bn-result-row"><span>Taxable Income</span><span>{fmt(result.taxableIncome)}</span></div>
          </div>

          <div className="bn-card">
            <h3>Tax Breakdown (Annual)</h3>
            <table className="bn-calc-table">
              <thead><tr><th>Income Range</th><th>Rate</th><th>Amount</th></tr></thead>
              <tbody>
                {result.breakdown.map((b, i) => (
                  <tr key={i}><td>{b.range}</td><td>{b.rate}</td><td>{fmt(b.amount)}</td></tr>
                ))}
                <tr className="bn-calc-row-active"><td>Total Tax</td><td /><td>{fmt(result.totalTax)}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bn-calc-note">
            <strong>Important Notes</strong>
            <ul>
              <li>Rates used are based on standard Nigerian PAYE tax bands.</li>
              <li>NHF and Pension are statutory contributions, not taxes.</li>
              <li>This calculator is for estimation purposes only.</li>
            </ul>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Saved Calculations</h3>
          {entries.map((e) => (
            <SavedRow
              key={e.id}
              label={`Income ${fmt(e.data.annualIncome)}`}
              value={`Tax ${fmt(e.data.totalTax)}`}
              copyText={`${`Income ${fmt(e.data.annualIncome)}`} — ${`Tax ${fmt(e.data.totalTax)}`}`}
              onDelete={() => remove(e.id)}
            />
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
