import { useState } from 'react';
import ToolPageShell from './ToolPageShell';
import Button from './Button';
import SavedRow from './SavedRow';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/InvoiceGenerator.css';

const emptyItem = () => ({ id: Date.now() + Math.random(), description: '', qty: 1, price: 0 });
const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Powers Quotation Generator, Estimate Generator and Delivery Note
 * Generator — all three are "business info + line items + preview"
 * documents that only differ in heading, item column labels, and whether
 * a numeric total makes sense (delivery notes track quantities, not price).
 */
export default function DocumentGeneratorPage({ slug, title, description, docLabel, itemLabel = 'Description', showPricing = true }) {
  const [business, setBusiness] = useState({ name: '', address: '', phone: '' });
  const [party, setParty] = useState({ name: '', address: '', phone: '' });
  const [docNumber, setDocNumber] = useState(`${docLabel.slice(0, 3).toUpperCase()}-1001`);
  const [docDate, setDocDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState([emptyItem(), emptyItem()]);
  const [notes, setNotes] = useState('Thank you for your business!');
  const { entries, save, remove } = useSavedCalculations(slug);

  const updateItem = (id, field, value) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const subtotal = items.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0), 0);

  const getCopyText = () => `${docLabel} ${docNumber}\nFrom: ${business.name}\nTo: ${party.name}` + (showPricing ? `\nTotal: ${fmt(subtotal)}` : '');
  const handleSave = () => save({ docNumber, business, party, items, subtotal });

  return (
    <ToolPageShell slug={slug} title={title} description={description} getCopyText={getCopyText} onSave={handleSave} resultSelector=".bn-invoice-preview">
      <div className="bn-invoice-layout">
        <div className="bn-invoice-form">
          <div className="bn-card">
            <h3>Business Information</h3>
            <div className="bn-input-group"><label>Business Name</label><input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} /></div>
            <div className="bn-input-group"><label>Address</label><input value={business.address} onChange={(e) => setBusiness({ ...business, address: e.target.value })} /></div>
            <div className="bn-input-group"><label>Phone / Email</label><input value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} /></div>
          </div>

          <div className="bn-card">
            <h3>{showPricing ? 'Bill To' : 'Delivered To'}</h3>
            <div className="bn-input-group"><label>Name</label><input value={party.name} onChange={(e) => setParty({ ...party, name: e.target.value })} /></div>
            <div className="bn-input-group"><label>Address</label><input value={party.address} onChange={(e) => setParty({ ...party, address: e.target.value })} /></div>
            <div className="bn-input-group"><label>Phone</label><input value={party.phone} onChange={(e) => setParty({ ...party, phone: e.target.value })} /></div>
          </div>

          <div className="bn-card">
            <h3>{docLabel} Details</h3>
            <div className="bn-input-row">
              <div className="bn-input-group"><label>{docLabel} Number</label><input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} /></div>
              <div className="bn-input-group"><label>Date</label><input type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} /></div>
            </div>
            {showPricing && (
              <div className="bn-input-group"><label>Valid Until</label><input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></div>
            )}
          </div>

          <div className="bn-card">
            <h3>Items</h3>
            {items.map((it) => (
              <div className="bn-invoice-item-row" key={it.id}>
                <input placeholder={itemLabel} value={it.description} onChange={(e) => updateItem(it.id, 'description', e.target.value)} />
                <input type="number" min="0" placeholder="Qty" value={it.qty} onChange={(e) => updateItem(it.id, 'qty', e.target.value)} />
                {showPricing && <input type="number" min="0" placeholder="Price" value={it.price} onChange={(e) => updateItem(it.id, 'price', e.target.value)} />}
                {showPricing && <span className="bn-invoice-item-total">{fmt(Number(it.qty || 0) * Number(it.price || 0))}</span>}
                <button type="button" className="bn-invoice-item-remove" onClick={() => removeItem(it.id)} aria-label="Remove item"><i className="fa-solid fa-trash" /></button>
              </div>
            ))}
            <Button variant="outline" size="sm" icon="fa-plus" onClick={addItem}>Add Item</Button>
            <div className="bn-input-group" style={{ marginTop: '1rem' }}>
              <label>Notes</label>
              <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bn-invoice-preview bn-card">
          <div className="bn-invoice-preview-head">
            <h2>{docLabel.toUpperCase()}</h2>
            <span>{docNumber}</span>
          </div>
          <div className="bn-invoice-preview-meta">
            <div>
              <strong>{business.name || 'Your Business Name'}</strong>
              <p>{business.address}</p>
              <p>{business.phone}</p>
            </div>
            <div className="bn-invoice-preview-dates">
              <p>Date: {docDate}</p>
              {showPricing && validUntil && <p>Valid Until: {validUntil}</p>}
            </div>
          </div>
          <div className="bn-invoice-preview-bill">
            <span>{showPricing ? 'Bill To:' : 'Delivered To:'}</span>
            <strong>{party.name || 'Name'}</strong>
            <p>{party.address}</p>
          </div>

          <table className="bn-invoice-table">
            <thead>
              <tr><th>{itemLabel}</th><th>Qty</th>{showPricing && <th>Price</th>}{showPricing && <th>Total</th>}</tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.description || '—'}</td>
                  <td>{it.qty}</td>
                  {showPricing && <td>{fmt(it.price)}</td>}
                  {showPricing && <td>{fmt(Number(it.qty || 0) * Number(it.price || 0))}</td>}
                </tr>
              ))}
            </tbody>
          </table>

          {showPricing && (
            <div className="bn-invoice-totals">
              <div className="bn-result-highlight" style={{ marginTop: '0.75rem' }}>
                <div className="bn-result-label">Total Amount</div>
                <div className="bn-result-value">{fmt(subtotal)}</div>
              </div>
            </div>
          )}

          {notes && <p className="bn-invoice-notes">{notes}</p>}
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Recent {docLabel}s</h3>
          {entries.map((e) => (
            <SavedRow
              key={e.id}
              label={`${e.data.docNumber} — ${e.data.party?.name || 'Client'}`}
              value={showPricing ? fmt(e.data.subtotal) : ''}
              copyText={`${docLabel} ${e.data.docNumber}\nFrom: ${e.data.business?.name || ''}\nTo: ${e.data.party?.name || ''}` + (showPricing ? `\nTotal: ${fmt(e.data.subtotal)}` : '')}
              onDelete={() => remove(e.id)}
            />
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
