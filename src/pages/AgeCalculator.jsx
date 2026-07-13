import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import '../styles/AgeCalculator.css';

const SLUG = 'age-calculator';

function calcAge(dob) {
  const birth = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const totalDays = Math.floor((today - birth) / 86400000);
  return { years, months, days, totalDays };
}

export default function AgeCalculator() {
  const [dob, setDob] = useState('2000-01-01');
  const result = useMemo(() => calcAge(dob), [dob]);

  const getCopyText = () => `Age Calculator\nAge: ${result.years} years, ${result.months} months, ${result.days} days`;

  return (
    <ToolPageShell slug={SLUG} title="Age Calculator" description="Calculate exact age from date of birth." getCopyText={getCopyText}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Date of Birth</h3>
          <div className="bn-input-group"><label>Date of Birth</label><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
        </div>
        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Your Age</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">Age</div>
              <div className="bn-result-value">{result.years} yrs {result.months} mo {result.days} d</div>
            </div>
            <div className="bn-result-row"><span>Total Days Lived</span><span>{result.totalDays.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
