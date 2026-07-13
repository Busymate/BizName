import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import '../styles/DateCalculator.css';

const SLUG = 'date-calculator';
const MS_PER_DAY = 86400000;

export default function DateCalculator() {
  const [mode, setMode] = useState('difference'); // 'difference' | 'add'
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 30 * MS_PER_DAY).toISOString().slice(0, 10));
  const [daysToAdd, setDaysToAdd] = useState(30);

  const result = useMemo(() => {
    if (mode === 'difference') {
      const diff = Math.round((new Date(endDate) - new Date(startDate)) / MS_PER_DAY);
      return { label: 'Days Between', value: `${diff} days`, weeks: Math.floor(Math.abs(diff) / 7) };
    }
    const resultDate = new Date(new Date(startDate).getTime() + Number(daysToAdd || 0) * MS_PER_DAY);
    return { label: 'Resulting Date', value: resultDate.toISOString().slice(0, 10) };
  }, [mode, startDate, endDate, daysToAdd]);

  const getCopyText = () => `Date Calculator\n${result.label}: ${result.value}`;

  return (
    <ToolPageShell slug={SLUG} title="Date Calculator" description="Add or subtract dates, or find the number of days between two dates." getCopyText={getCopyText}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Details</h3>
          <div className="bn-input-group">
            <label>Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="difference">Days Between Two Dates</option>
              <option value="add">Add/Subtract Days</option>
            </select>
          </div>
          {mode === 'difference' ? (
            <>
              <div className="bn-input-group"><label>Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
              <div className="bn-input-group"><label>End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
            </>
          ) : (
            <>
              <div className="bn-input-group"><label>Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
              <div className="bn-input-group"><label>Days to Add (use negative to subtract)</label><input type="number" value={daysToAdd} onChange={(e) => setDaysToAdd(e.target.value)} /></div>
            </>
          )}
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Result</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">{result.label}</div>
              <div className="bn-result-value">{result.value}</div>
            </div>
            {result.weeks !== undefined && <div className="bn-result-row"><span>Approx. Weeks</span><span>{result.weeks}</span></div>}
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
