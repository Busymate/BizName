import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import '../styles/TimeCalculator.css';

const SLUG = 'time-calculator';

export default function TimeCalculator() {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:30');

  const result = useMemo(() => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    let diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return { hours, minutes, totalMinutes: diffMinutes };
  }, [startTime, endTime]);

  const getCopyText = () => `Time Calculator\nDifference: ${result.hours}h ${result.minutes}m`;

  return (
    <ToolPageShell slug={SLUG} title="Time Calculator" description="Calculate the time difference between two times." getCopyText={getCopyText}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Times</h3>
          <div className="bn-input-group"><label>Start Time</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
          <div className="bn-input-group"><label>End Time</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
        </div>
        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Time Difference</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">Duration</div>
              <div className="bn-result-value">{result.hours}h {result.minutes}m</div>
            </div>
            <div className="bn-result-row"><span>Total Minutes</span><span>{result.totalMinutes}</span></div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
