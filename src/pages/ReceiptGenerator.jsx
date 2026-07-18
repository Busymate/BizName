import { useState } from 'react';
import ToolPageShell from '../components/ToolPageShell';
import SavedRow from '../components/SavedRow';
import useSavedCalculations from '../hooks/useSavedCalculations';
import '../styles/ReceiptGenerator.css';

const SLUG = 'receipt-generator';

export default function ReceiptGenerator() {
  const [business, setBusiness] = useState({ name: '', address: '', phone: '' });
  const [receiptNumber, setReceiptNumber] = useState('RCP-1001');
  const [receiptDate, setReceiptDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [receivedFrom, setReceivedFrom] = useState('');
  const [description, setDescription] = useState('Payment for services');
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('Thank you for your payment!');

  const { entries, save, remove } = useSavedCalculations(SLUG);

  const fmt = (n) => `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getCopyText = () => `Receipt ${receiptNumber}\nReceived from: ${receivedFrom}\nAmount: ${fmt(amount)}`;
  const handleSave = () => save({ receiptNumber, receivedFrom, amount, receiptDate });

  return (
    <ToolPageShell slug={SLUG} title="Receipt Generator" description="Create professional receipts in seconds. Download and share easily." getCopyText={getCopyText} onSave={handleSave}>
      <div className="bn-invoice-layout">
        <div className="bn-invoice-form">
          <div className="bn-card">
            <h3>Business Details</h3>
            <div className="bn-input-group"><label>Business Name</label><input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} /></div>
            <div className="bn-input-group"><label>Business Address</label><input value={business.address} onChange={(e) => setBusiness({ ...business, address: e.target.value })} /></div>
            <div className="bn-input-group"><label>Phone / Email</label><input value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} /></div>
          </div>
          <div className="bn-card">
            <h3>Receipt Details</h3>
            <div className="bn-input-row">
              <div className="bn-input-group"><label>Receipt Number</label><input value={receiptNumber} onChange={(e) => setReceiptNumber(e.target.value)} /></div>
              <div className="bn-input-group"><label>Receipt Date</label><input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} /></div>
            </div>
            <div className="bn-input-group">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option>Cash</option><option>Bank Transfer</option><option>Card</option><option>Mobile Money</option>
              </select>
            </div>
            <div className="bn-input-group"><label>Received From</label><input value={receivedFrom} onChange={(e) => setReceivedFrom(e.target.value)} placeholder="Customer name" /></div>
            <div className="bn-input-group"><label>Item Description</label><input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="bn-input-group"><label>Amount (₦)</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div className="bn-input-group"><label>Notes</label><textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </div>
        </div>

        <div className="bn-invoice-preview bn-card">
          <div className="bn-invoice-preview-head">
            <h2>RECEIPT</h2>
            <span>{receiptNumber}</span>
          </div>
          <p className="bn-receipt-business">{business.name || 'Your Business Name'}<br />{business.address}<br />{business.phone}</p>
          <div className="bn-result-row"><span>Date</span><span>{receiptDate}</span></div>
          <div className="bn-result-row"><span>Received From</span><span>{receivedFrom || '—'}</span></div>
          <div className="bn-result-row"><span>Payment Method</span><span>{paymentMethod}</span></div>
          <div className="bn-result-row"><span>{description || 'Item'}</span><span>{fmt(amount)}</span></div>
          <div className="bn-result-highlight" style={{ marginTop: '0.75rem' }}>
            <div className="bn-result-label">Total Amount</div>
            <div className="bn-result-value">{fmt(amount)}</div>
          </div>
          {notes && <p className="bn-invoice-notes">{notes}</p>}
        </div>
      </div>

      {entries.length > 0 && (
        <div className="bn-card bn-saved-list">
          <h3>Recent Receipts</h3>
          {entries.map((e) => (
            <SavedRow
              key={e.id}
              label={`${e.data.receiptNumber} — ${e.data.receivedFrom || 'Customer'}`}
              value={`₦${Number(e.data.amount).toLocaleString()}`}
              copyText={`Receipt ${e.data.receiptNumber}\nFrom: ${e.data.receivedFrom || 'Customer'}\nAmount: ₦${Number(e.data.amount).toLocaleString()}`}
              onDelete={() => remove(e.id)}
            />
          ))}
        </div>
      )}
    </ToolPageShell>
  );
}
