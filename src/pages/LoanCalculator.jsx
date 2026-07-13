import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/LoanCalculator.css';

const SLUG = 'loan-calculator';
const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(12);
  const [tenureYears, setTenureYears] = useState(2);
  const { entries, save, remove } = useSavedCalculations(SLUG);

  const result = useMemo(() => {
    const P = Number(loanAmount || 0);
    const annualRate = Number(interestRate || 0) / 100;
    const n = Number(tenureYears || 0) * 12;
    const r = annualRate / 12;
    const monthlyPayment = r > 0 && n > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : n > 0 ? P / n : 0;
    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - P;

    const schedule = [];
    let balance = P;
    for (let i = 1; i <= n && i <= 24; i++) {
      const interestPortion = balance * r;
      const principalPortion = monthlyPayment - interestPortion;
      balance = Math.max(0, balance - principalPortion);
      schedule.push({ n: i, payment: monthlyPayment, principal: principalPortion, interest: interestPortion, balance });
    }

    return { monthlyPayment, totalPayment, totalInterest, schedule, n };
  }, [loanAmount, interestRate, tenureYears]);

  const getCopyText = () => `Loan Calculator\nMonthly Payment: ${fmt(result.monthlyPayment)}\nTotal Interest: ${fmt(result.totalInterest)}\nTotal Payment: ${fmt(result.totalPayment)}`;
  const handleSave = () => save({ loanAmount, interestRate, tenureYears, ...result, schedule: undefined });

  const tenureOptions = [1, 2, 3, 5];

  return (
    <ToolPageShell slug={SLUG} title="Loan Calculator" description="Calculate your loan payments, total interest and repayment schedule." getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Loan Details</h3>
          <div className="bn-input-group">
            <label>Loan Amount (₦)</label>
            <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Interest Rate (%)</label>
            <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
          </div>
          <div className="bn-input-group">
            <label>Loan Tenure (Years)</label>
            <select value={tenureYears} onChange={(e) => setTenureYears(e.target.value)}>
              {tenureOptions.map((y) => <option key={y} value={y}>{y} Year{y > 1 ? 's' : ''}</option>)}
            </select>
          </div>

          <div className="bn-calc-note">
            <strong>Popular Loan Tenures</strong>
            {tenureOptions.map((y) => {
              const r = Number(interestRate || 0) / 100 / 12;
              const n = y * 12;
              const P = Number(loanAmount || 0);
              const mp = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
              return <p key={y}>{y} Year{y > 1 ? 's' : ''}: {fmt(mp)}/month</p>;
            })}
          </div>
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Loan Summary</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">Monthly Payment</div>
              <div className="bn-result-value">{fmt(result.monthlyPayment)}</div>
            </div>
            <div className="bn-result-row"><span>Loan Amount</span><span>{fmt(loanAmount)}</span></div>
            <div className="bn-result-row"><span>Interest Rate (Annual)</span><span>{interestRate}%</span></div>
            <div className="bn-result-row"><span>Number of Payments</span><span>{result.n}</span></div>
            <div className="bn-result-row"><span>Total Interest</span><span>{fmt(result.totalInterest)}</span></div>
            <div className="bn-result-row"><span>Total Payment</span><span>{fmt(result.totalPayment)}</span></div>
          </div>

          <div className="bn-card">
            <h3>Amortization Schedule {result.n > 24 && '(first 24 months)'}</h3>
            <div className="bn-table-scroll">
              <table className="bn-calc-table">
                <thead><tr><th>#</th><th>Payment</th><th>Principal</th><th>Interest</th><th>Balance</th></tr></thead>
                <tbody>
                  {result.schedule.map((row) => (
                    <tr key={row.n}>
                      <td>{row.n}</td>
                      <td>{fmt(row.payment)}</td>
                      <td>{fmt(row.principal)}</td>
                      <td>{fmt(row.interest)}</td>
                      <td>{fmt(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Saved Calculations</h3>
          {entries.map((e) => (
            <div key={e.id} className="bn-saved-row">
              <span>Loan {fmt(e.data.loanAmount)}</span>
              <span>{fmt(e.data.monthlyPayment)}/mo</span>
              <button onClick={() => remove(e.id)} aria-label="Delete"><i className="fa-solid fa-trash" /></button>
            </div>
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
