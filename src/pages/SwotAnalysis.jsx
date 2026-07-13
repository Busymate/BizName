import { useState } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/SwotAnalysis.css';

const SLUG = 'swot-analysis';
const QUADRANTS = [
  { key: 'strengths', label: 'Strengths', color: 'green', icon: 'circle-check' },
  { key: 'weaknesses', label: 'Weaknesses', color: 'orange', icon: 'triangle-exclamation' },
  { key: 'opportunities', label: 'Opportunities', color: 'blue', icon: 'lightbulb' },
  { key: 'threats', label: 'Threats', color: 'red', icon: 'shield-halved' },
];

export default function SwotAnalysis() {
  const [businessName, setBusinessName] = useState('');
  const [data, setData] = useState({
    strengths: ['Strong brand reputation', 'Loyal customer base'],
    weaknesses: ['Limited marketing budget'],
    opportunities: ['Growing market demand', 'Expansion into new markets'],
    threats: ['Intense competition'],
  });
  const [draft, setDraft] = useState({ strengths: '', weaknesses: '', opportunities: '', threats: '' });
  const { entries, save, remove } = useSavedCalculations(SLUG);

  const addPoint = (key) => {
    if (!draft[key].trim()) return;
    setData((prev) => ({ ...prev, [key]: [...prev[key], draft[key].trim()] }));
    setDraft((prev) => ({ ...prev, [key]: '' }));
  };
  const removePoint = (key, idx) => setData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));

  const getCopyText = () =>
    `SWOT Analysis — ${businessName || 'Business'}\n` +
    QUADRANTS.map((q) => `${q.label}:\n${data[q.key].map((p) => `- ${p}`).join('\n')}`).join('\n\n');

  const handleSave = () => save({ businessName, data });

  return (
    <ToolPageShell slug={SLUG} title="SWOT Analysis Tool" description="Analyze your business strengths, weaknesses, opportunities and threats." getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-card" style={{ marginBottom: '1.25rem' }}>
        <div className="bn-input-group" style={{ maxWidth: 360 }}>
          <label>Business Name</label>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your Business Name" />
        </div>
      </div>

      <div className="bn-swot-grid">
        {QUADRANTS.map((q) => (
          <div className={`bn-swot-quadrant bn-swot-${q.color}`} key={q.key}>
            <h4><i className={`fa-solid fa-${q.icon}`} /> {q.label} <span>{data[q.key].length}</span></h4>
            <ul>
              {data[q.key].map((p, i) => (
                <li key={i}>
                  {p}
                  <button onClick={() => removePoint(q.key, i)} aria-label="Remove"><i className="fa-solid fa-xmark" /></button>
                </li>
              ))}
            </ul>
            <div className="bn-swot-add">
              <input
                value={draft[q.key]}
                onChange={(e) => setDraft((prev) => ({ ...prev, [q.key]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addPoint(q.key)}
                placeholder={`Add ${q.label.toLowerCase().slice(0, -1)}...`}
              />
              <button onClick={() => addPoint(q.key)} type="button">+ Add</button>
            </div>
          </div>
        ))}
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list" style={{ marginTop: '1.5rem' }}>
          <h3>Saved Analyses</h3>
          {entries.map((e) => (
            <div key={e.id} className="bn-saved-row">
              <span>{e.data.businessName || 'Untitled'}</span>
              <span>{new Date(e.savedAt).toLocaleDateString()}</span>
              <button onClick={() => remove(e.id)} aria-label="Delete"><i className="fa-solid fa-trash" /></button>
            </div>
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
