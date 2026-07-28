import { useState } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import SavedRow from '../components/SavedRow';
import Button from '../components/Button';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/InvoiceGenerator.css';

const SLUG = 'invoice-generator';
const emptyItem = () => ({ id: Date.now() + Math.random(), description: '', qty: 1, price: 0 });

export default function InvoiceGenerator() {
  const [business, setBusiness] = useState({ name: '', address: '', phone: '', email: '' });
  const [client, setClient] = useState({ name: '', address: '', phone: '', email: '' });
  const [invoiceNumber, setInvoiceNumber] = useState('INV-1001');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('₦');
  const [items, setItems] = useState([emptyItem(), emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(7.5);
  const [notes, setNotes] = useState('Thank you for your business! Payment is due within 14 days.');
  const [status, setStatus] = useState('Pending');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');

  const { entries, save, remove } = useSavedCalculations(SLUG, {
    typeFor: 'invoice',
    nameFor: (data) => `${data.invoiceNumber} — ${data.client?.name || 'Client'}`,
  });

  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  const subtotal = items.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0), 0);
  const discountAmount = (subtotal * Number(discount || 0)) / 100;
  const taxable = subtotal - discountAmount;
  const taxAmount = (taxable * Number(taxRate || 0)) / 100;
  const total = taxable + taxAmount;

  const fmt = (n) => `${currency}${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getCopyText = () =>
    `Invoice ${invoiceNumber}\nFrom: ${business.name}\nTo: ${client.name}\nTotal: ${fmt(total)}`;

  const handleSave = () => {
    save({ invoiceNumber, business, client, items, total, currency, status, invoiceDate, dueDate, paymentMethod });
  };

  return (
    <ToolPageShell
      slug={SLUG}
      title="Invoice Generator"
      description="Create professional invoices in seconds. Download and share easily."
      getCopyText={getCopyText}
      onSave={handleSave}
      resultSelector=".bn-invoice-preview"
    >
      <div className="bn-invoice-layout">
        <div className="bn-invoice-form">
          <div className="bn-card">
            <h3>Business Information</h3>
            <div className="bn-input-group">
              <label>Business Name</label>
              <input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} placeholder="Your Business Name" />
            </div>
            <div className="bn-input-group">
              <label>Address</label>
              <input value={business.address} onChange={(e) => setBusiness({ ...business, address: e.target.value })} placeholder="Business address" />
            </div>
            <div className="bn-input-row">
              <div className="bn-input-group">
                <label>Phone</label>
                <input value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} placeholder="Phone" />
              </div>
              <div className="bn-input-group">
                <label>Email</label>
                <input value={business.email} onChange={(e) => setBusiness({ ...business, email: e.target.value })} placeholder="Email" />
              </div>
            </div>
          </div>

          <div className="bn-card">
            <h3>Bill To</h3>
            <div className="bn-input-group">
              <label>Client Name</label>
              <input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} placeholder="Client name" />
            </div>
            <div className="bn-input-group">
              <label>Client Address</label>
              <input value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} placeholder="Client address" />
            </div>
          </div>

          <div className="bn-card">
            <h3>Invoice Details</h3>
            <div className="bn-input-row">
              <div className="bn-input-group">
                <label>Invoice Number</label>
                <input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
              </div>
              <div className="bn-input-group">
                <label>Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="₦">NGN — ₦</option>
                  <option value="$">USD — $</option>
                  <option value="€">EUR — €</option>
                  <option value="£">GBP — £</option>
                </select>
              </div>
            </div>
            <div className="bn-input-row">
              <div className="bn-input-group">
                <label>Invoice Date</label>
                <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
              </div>
              <div className="bn-input-group">
                <label>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="bn-input-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>Pending</option>
                <option>Paid</option>
              </select>
            </div>
            <div className="bn-input-group">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option>Bank Transfer</option>
                <option>Cash</option>
                <option>Card</option>
                <option>Mobile Money</option>
              </select>
            </div>
          </div>

          <div className="bn-card">
            <h3>Items</h3>
            {items.map((it) => (
              <div className="bn-invoice-item-row" key={it.id}>
                <input
                  placeholder="Item description"
                  value={it.description}
                  onChange={(e) => updateItem(it.id, 'description', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Qty"
                  value={it.qty}
                  onChange={(e) => updateItem(it.id, 'qty', e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Unit Price"
                  value={it.price}
                  onChange={(e) => updateItem(it.id, 'price', e.target.value)}
                />
                <span className="bn-invoice-item-total">{fmt(Number(it.qty || 0) * Number(it.price || 0))}</span>
                <button type="button" className="bn-invoice-item-remove" onClick={() => removeItem(it.id)} aria-label="Remove item">
                  <i className="fa-solid fa-trash" />
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" icon="fa-plus" onClick={addItem}>Add Item</Button>

            <div className="bn-input-row" style={{ marginTop: '1.25rem' }}>
              <div className="bn-input-group">
                <label>Discount (%)</label>
                <input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <div className="bn-input-group">
                <label>Tax / VAT (%)</label>
                <input type="number" min="0" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
              </div>
            </div>
            <div className="bn-input-group">
              <label>Notes / Terms</label>
              <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bn-invoice-preview bn-card">
          <div className="bn-invoice-preview-head">
            <h2>INVOICE</h2>
            <span>{invoiceNumber}</span>
          </div>
          <div className="bn-invoice-preview-meta">
            <div>
              <strong>{business.name || 'Your Business Name'}</strong>
              <p>{business.address}</p>
              <p>{business.phone} {business.email && `· ${business.email}`}</p>
            </div>
            <div className="bn-invoice-preview-dates">
              <p>Date: {invoiceDate}</p>
              {dueDate && <p>Due: {dueDate}</p>}
              <p>Payment: {paymentMethod}</p>
            </div>
          </div>
          <div className="bn-invoice-preview-bill">
            <span>Bill To:</span>
            <strong>{client.name || 'Client Name'}</strong>
            <p>{client.address}</p>
          </div>

          <table className="bn-invoice-table">
            <thead>
              <tr><th>Description</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.description || '—'}</td>
                  <td>{it.qty}</td>
                  <td>{fmt(it.price)}</td>
                  <td>{fmt(Number(it.qty || 0) * Number(it.price || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bn-invoice-totals">
            <div className="bn-result-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
            {discount > 0 && <div className="bn-result-row"><span>Discount ({discount}%)</span><span>-{fmt(discountAmount)}</span></div>}
            {taxRate > 0 && <div className="bn-result-row"><span>Tax ({taxRate}%)</span><span>{fmt(taxAmount)}</span></div>}
            <div className="bn-result-highlight" style={{ marginTop: '0.75rem' }}>
              <div className="bn-result-label">Total Amount</div>
              <div className="bn-result-value">{fmt(total)}</div>
            </div>
          </div>

          {notes && <p className="bn-invoice-notes">{notes}</p>}
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Recent Invoices</h3>
          {entries.map((e) => (
            <SavedRow
              key={e.id}
              label={`${e.data.invoiceNumber} — ${e.data.client?.name || 'Client'} (${e.data.status || 'Pending'})`}
              value={`${e.data.currency}${Number(e.data.total).toLocaleString()}`}
              copyText={`Invoice ${e.data.invoiceNumber}\nClient: ${e.data.client?.name || 'Client'}\nTotal: ${e.data.currency}${Number(e.data.total).toLocaleString()}`}
              onDelete={() => remove(e.id)}
            />
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
