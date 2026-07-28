import { useMemo, useState } from 'react';
import ToolPageShell from './ToolPageShell';
import SavedRow from './SavedRow';
import Button from './Button';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/GenericGenerator.css';

/**
 * Config-driven content generator page (business names, slogans, hashtags,
 * social posts, email copy, ad copy, product descriptions). All generation
 * happens client-side from template + keyword combination — there is no
 * backend or paid AI API involved, matching the "no backend" requirement.
 *
 * fields: same shape as GenericCalculatorPage.
 * generate(values): => string[] (list of generated results)
 */
export default function GenericGeneratorPage({ slug, title, description, fields, generate }) {
  const initial = Object.fromEntries(fields.map((f) => [f.key, f.default]));
  const [values, setValues] = useState(initial);
  const [results, setResults] = useState(() => generate(initial));
  const [likedIdx, setLikedIdx] = useState([]);
  const { entries, save, remove } = useSavedCalculations(slug);

  const update = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));
  const handleGenerate = () => setResults(generate(values));
  const toggleLike = (i) => setLikedIdx((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const getCopyText = () => results.join('\n');
  const handleSave = () => save({ values, results });

  return (
    <ToolPageShell slug={slug} title={title} description={description} getCopyText={getCopyText} onSave={handleSave} resultSelector=".bn-gen-results">
      <div className="bn-gen-layout">
        <div className="bn-gen-form bn-card">
          <h3>Enter Details</h3>
          {fields.map((f) => (
            <div className="bn-input-group" key={f.key}>
              <label>{f.label}</label>
              {f.type === 'select' ? (
                <select value={values[f.key]} onChange={(e) => update(f.key, e.target.value)}>
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea rows="3" value={values[f.key]} onChange={(e) => update(f.key, e.target.value)} placeholder={f.placeholder} />
              ) : (
                <input value={values[f.key]} onChange={(e) => update(f.key, e.target.value)} placeholder={f.placeholder} />
              )}
            </div>
          ))}
          <Button variant="primary" icon="fa-wand-magic-sparkles" onClick={handleGenerate}>Generate</Button>
        </div>

        <div className="bn-gen-results bn-card">
          <h3>Generated Results</h3>
          <div className="bn-gen-list">
            {results.map((r, i) => (
              <div className="bn-gen-item" key={i}>
                <span>{r}</span>
                <button
                  className={`bn-gen-like ${likedIdx.includes(i) ? 'is-liked' : ''}`}
                  onClick={() => toggleLike(i)}
                  type="button"
                  aria-label="Like"
                >
                  <i className={`fa-${likedIdx.includes(i) ? 'solid' : 'regular'} fa-heart`} />
                </button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" icon="fa-rotate" onClick={handleGenerate}>Load More Results</Button>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Saved Results</h3>
          {entries.map((e) => (
            <SavedRow
              key={e.id}
              label={e.data.results?.[0] || 'Saved result'}
              value={new Date(e.savedAt).toLocaleDateString()}
              copyText={(e.data.results || []).join('\n')}
              onDelete={() => remove(e.id)}
            />
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
