import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import SavedRow from '../components/SavedRow';
import Button from '../components/Button';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/StartupCostCalculator.css';

const SLUG = 'startup-cost-calculator';
const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const defaultItems = () => ([
  { id: 1, category: 'Business Registration', cost: 150000 },
  { id: 2, category: 'Equipment & Tools', cost: 850000 },
  { id: 3, category: 'Inventory / Supplies', cost: 500000 },
  { id: 4, category: 'Marketing & Branding', cost: 300000 },
  { id: 5, category: 'Website & Software', cost: 250000 },
]);

export default function StartupCostCalculator() {
  const [items, setItems] = useState(defaultItems());
  const { entries, save, remove } = useSavedCalculations(SLUG);

  const total = useMemo(() => items.reduce((sum, it) => sum + Number(it.cost || 0), 0), [items]);

  const updateItem = (id, field, value) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  const addItem = () => setItems((prev) => [...prev, { id: Date.now(), category: '', cost: 0 }]);
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const getCopyText = () => `Startup Cost Calculator\nTotal Estimated Cost: ${fmt(total)}\n` + items.map((i) => `${i.category}: ${fmt(i.cost)}`).join('\n');
  const handleSave = () => save({ items, total });

  return (
    <ToolPageShell slug={SLUG} title="Startup Cost Calculator" description="Estimate the total cost to start your business and plan your budget effectively." getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-startup-layout">
        <div className="bn-card">
          <h3>Startup Cost Breakdown</h3>
          {items.map((it) => (
            <div className="bn-startup-row" key={it.id}>
              <input value={it.category} onChange={(e) => updateItem(it.id, 'category', e.target.value)} placeholder="Cost category" />
              <input type="number" value={it.cost} onChange={(e) => updateItem(it.id, 'cost', e.target.value)} placeholder="Estimated cost" />
              <button type="button" onClick={() => removeItem(it.id)} aria-label="Remove"><i className="fa-solid fa-trash" /></button>
            </div>
          ))}
          <Button variant="outline" size="sm" icon="fa-plus" onClick={addItem}>Add New Item</Button>
        </div>

        <div className="bn-card">
          <h3>Summary</h3>
          <div className="bn-result-highlight">
            <div className="bn-result-label">Total Estimated Startup Cost</div>
            <div className="bn-result-value">{fmt(total)}</div>
          </div>
          {items.map((it) => (
            <div className="bn-result-row" key={it.id}><span>{it.category || 'Untitled'}</span><span>{fmt(it.cost)}</span></div>
          ))}
          <div className="bn-calc-note">
            <strong>Tips</strong>
            <ul>
              <li>Start small and scale gradually.</li>
              <li>Focus on essential expenses first.</li>
              <li>Keep a buffer for unexpected costs.</li>
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
              label={`Saved ${new Date(e.savedAt).toLocaleDateString()}`}
              value={fmt(e.data.total)}
              copyText={`Startup Cost Calculator\nTotal Estimated Cost: ${fmt(e.data.total)}`}
              onDelete={() => remove(e.id)}
            />
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
