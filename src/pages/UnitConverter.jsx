import { useState, useMemo } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import '../styles/UnitConverter.css';

const SLUG = 'unit-converter';

const CATEGORIES = {
  Length: { base: 'm', units: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.34 } },
  Weight: { base: 'kg', units: { mg: 0.000001, g: 0.001, kg: 1, ton: 1000, oz: 0.0283495, lb: 0.453592 } },
  Area: { base: 'sqm', units: { sqm: 1, sqkm: 1000000, sqft: 0.092903, acre: 4046.86, hectare: 10000 } },
};

export default function UnitConverter() {
  const [category, setCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('ft');
  const [value, setValue] = useState(1);

  const result = useMemo(() => {
    const units = CATEGORIES[category].units;
    const inBase = Number(value || 0) * units[fromUnit];
    return inBase / units[toUnit];
  }, [category, fromUnit, toUnit, value]);

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    const keys = Object.keys(CATEGORIES[cat].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1]);
  };

  const getCopyText = () => `${value} ${fromUnit} = ${result.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${toUnit}`;

  return (
    <ToolPageShell slug={SLUG} title="Unit Converter" description="Convert length, area, weight and more instantly." getCopyText={getCopyText}>
      <div className="bn-calc-layout">
        <div className="bn-calc-form bn-card">
          <h3>Enter Details</h3>
          <div className="bn-input-group">
            <label>Category</label>
            <select value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
              {Object.keys(CATEGORIES).map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="bn-input-group">
            <label>From</label>
            <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
              {Object.keys(CATEGORIES[category].units).map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="bn-input-group">
            <label>To</label>
            <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
              {Object.keys(CATEGORIES[category].units).map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="bn-input-group">
            <label>Value</label>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
        </div>

        <div className="bn-calc-results">
          <div className="bn-card">
            <h3>Result</h3>
            <div className="bn-result-highlight">
              <div className="bn-result-label">{value} {fromUnit} =</div>
              <div className="bn-result-value">{result.toLocaleString(undefined, { maximumFractionDigits: 4 })} {toUnit}</div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
