import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import useSavedCalculations from '../hooks/useSavedCalculations';
import { calculatePAYE } from '../utils/taxEngine';
import '../styles/SalaryCalculator.css';

const SLUG = 'salary-calculator';
const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SalaryCalculator() {
  const [annualSalary, setAnnualSalary] = useState(5000000);
  const [payFrequency, setPayFrequency] = useState('Monthly');
  const [pensionPct, setPensionPct] = useState(7.5);
  const [nhfPct, setNhfPct] = useState(2.5);
  const [otherDeductions, setOtherDeductions] = useState(50000);
  const { entries, save, remove } = useSavedCalculations(SLUG);

  const result = useMemo(() => {
    const gross = Number(annualSalary || 0);
    const pension = (gross * Number(pensionPct || 0)) / 100;
    const nhf = (gross * Number(nhfPct || 0)) / 100;
    const other = Number(otherDeductions || 0);
    const taxableIncome = Math.max(0, gross - pension - nhf);
    const { totalTax } = calculatePAYE(taxableIncome);
    const totalDeductions = pension + nhf + other + totalTax;
    const netAnnual = gross - totalDeductions;
    const divisor = payFrequency === 'Monthly' ? 12 : payFrequency === 'Weekly' ? 52 : 1;
    return {
      gross, pension, nhf, other, totalTax, totalDeductions, netAnnual,
      netPeriod: netAnnual / divisor,
      grossPeriod: gross / divisor,
    };
  }, [annualSalary, pensionPct, nhfPct, otherDeductions, payFrequency]);

  const getCopyText = () => `Salary Calculator\nGross: ${fmt(result.gross)}\nTake-Home (${payFrequency}): ${fmt(result.netPeriod)}`;
  const handleSave = () => save({ annualSalary, payFrequency, pensionPct, nhfPct, otherDeductions, ...result });

  return (
    <ToolPageShell slug={SLUG} title="Salary Calculator" description="Calculate your salary, deductions and take-home pay instantly." getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Details</h3>
          <div className="bn-input-group">
            <label>Annual Salary (₦)</label>
            <input type="number" value={annualSalary} onChange={(e) => setAnnualSalary(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Pay Frequency</label>
            <select value={payFrequency} onChange={(e) => setPayFrequency(e.target.value)}>
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Annually</option>
            </select>
          </div>
          <div className="bn-input-group">
            <label>Pension Contribution (%)</label>
            <input type="number" value={pensionPct} onChange={(e) => setPensionPct(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>NHF Contribution (%)</label>
            <input type="number" value={nhfPct} onChange={(e) => setNhfPct(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Other Deductions (₦)</label>
            <input type="number" value={otherDeductions} onChange={(e) => setOtherDeductions(e.target.value)} />
          </div>
          <p className="bn-calc-disclaimer">These values are for calculation purposes only.</p>
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Salary Summary</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">Take-Home Pay ({payFrequency})</div>
              <div className="bn-result-value">{fmt(result.netPeriod)}</div>
            </div>
            <div className="bn-result-row"><span>Gross Salary ({payFrequency})</span><span>{fmt(result.grossPeriod)}</span></div>
            <div className="bn-result-row"><span>Total Deductions</span><span>{fmt(result.totalDeductions)}</span></div>
            <div className="bn-result-row"><span>Net Salary (Annual)</span><span>{fmt(result.netAnnual)}</span></div>
          </div>

          <div className="bn-card">
            <h3>Deductions Breakdown</h3>
            <div className="bn-result-row"><span>PAYE (Income Tax)</span><span>{fmt(result.totalTax)}</span></div>
            <div className="bn-result-row"><span>Pension ({pensionPct}%)</span><span>{fmt(result.pension)}</span></div>
            <div className="bn-result-row"><span>NHF ({nhfPct}%)</span><span>{fmt(result.nhf)}</span></div>
            <div className="bn-result-row"><span>Other Deductions</span><span>{fmt(result.other)}</span></div>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Saved Calculations</h3>
          {entries.map((e) => (
            <div key={e.id} className="bn-saved-row">
              <span>Gross {fmt(e.data.annualSalary)}</span>
              <span>Net {fmt(e.data.netPeriod)}</span>
              <button onClick={() => remove(e.id)} aria-label="Delete"><i className="fa-solid fa-trash" /></button>
            </div>
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
