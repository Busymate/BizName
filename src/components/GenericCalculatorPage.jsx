import { useMemo, useState } from 'react';
import ToolPageShell from './ToolPageShell';
import SavedRow from './SavedRow';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/Calculator.css';

/**
 * Config-driven calculator page. Powers the simpler single-formula tools
 * (markup, ROI, shipping, sales tax, unit price, leave, overtime,
 * attendance, gratuity, bonus, inventory, profit margin, fuel cost, etc.)
 * so each one stays a real, working tool without duplicating the same
 * form/result/save/print/copy/share scaffolding by hand every time.
 *
 * fields: [{ key, label, type: 'number'|'select'|'text', default, options?, suffix? }]
 * compute(values): => { highlight: { label, value }, rows: [{label, value}], note? }
 * formatValue(n): optional custom formatter, defaults to plain number
 */
export default function GenericCalculatorPage({
  slug,
  title,
  description,
  fields,
  compute,
  formatValue = (n) => Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }),
  noteContent,
}) {
  const initial = Object.fromEntries(fields.map((f) => [f.key, f.default]));
  const [values, setValues] = useState(initial);
  const { entries, save, remove } = useSavedCalculations(slug);

  const result = useMemo(() => compute(values), [values]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));

  const getCopyText = () =>
    `${title}\n${result.highlight.label}: ${formatValue(result.highlight.value)}\n` +
    result.rows.map((r) => `${r.label}: ${formatValue(r.value)}`).join('\n');

  const handleSave = () => save({ ...values, highlightValue: result.highlight.value });

  return (
    <ToolPageShell slug={slug} title={title} description={description} getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Details</h3>
          {fields.map((f) => (
            <div className="bn-input-group" key={f.key}>
              <label>{f.label}</label>
              {f.type === 'select' ? (
                <select value={values[f.key]} onChange={(e) => update(f.key, e.target.value)}>
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input
                  type={f.type || 'number'}
                  value={values[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Result</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">{result.highlight.label}</div>
              <div className="bn-result-value">{formatValue(result.highlight.value)}</div>
            </div>
            {result.rows.map((r) => (
              <div className="bn-result-row" key={r.label}>
                <span>{r.label}</span>
                <span>{formatValue(r.value)}</span>
              </div>
            ))}
            {(result.note || noteContent) && (
              <div className="bn-calc-note">{result.note || noteContent}</div>
            )}
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
              value={formatValue(e.data.highlightValue)}
              copyText={`${title}\n${result.highlight.label}: ${formatValue(e.data.highlightValue)}`}
              onDelete={() => remove(e.id)}
            />
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
