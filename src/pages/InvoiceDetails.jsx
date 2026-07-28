import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { getSavedItemById } from '../lib/savedItems';
import '../styles/BusinessSuite.css';
import '../styles/InvoiceDetails.css';

export default function InvoiceDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getSavedItemById(id)
      .then((row) => { if (!cancelled) setItem(row); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load this invoice.'); })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id]);

  const handlePrint = () => window.print();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: item?.name || 'Invoice', url }); }
      catch { /* user cancelled the share sheet — not an error */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      alert('Invoice link copied to clipboard.');
    } catch {
      /* clipboard unavailable — nothing more we can do without a share sheet */
    }
  };

  if (loading) {
    return <div className="bn-container" style={{ margin: '3rem auto', textAlign: 'center' }}>Loading invoice…</div>;
  }

  if (error || !item) {
    return (
      <div className="bn-container" style={{ maxWidth: 480, margin: '3rem auto', textAlign: 'center' }}>
        <h2>Couldn't load this invoice</h2>
        <p className="bn-newsletter-error">{error || 'Invoice not found.'}</p>
        <Link to="/saved-items?type=invoice" className="bn-quick-action" style={{ display: 'inline-flex', width: 'fit-content', margin: '1rem auto 0' }}>
          <i className="fa-solid fa-arrow-left" /> Back to Invoices
        </Link>
      </div>
    );
  }

  const d = item.payload || {};
  const items = Array.isArray(d.items) ? d.items : [];
  const currency = d.currency || '₦';
  const subtotal = items.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0), 0);
  const discountAmount = (subtotal * Number(d.discount || 0)) / 100;
  const taxable = subtotal - discountAmount;
  const taxAmount = (taxable * Number(d.taxRate || 0)) / 100;
  const total = d.total !== undefined ? Number(d.total) : taxable + taxAmount;
  const fmt = (n) => `${currency}${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const status = (d.status || 'Pending').toLowerCase();

  const client = d.client || {};
  const business = d.business || {};

  const mailtoHref = (() => {
    const subject = encodeURIComponent(`Invoice ${d.invoiceNumber || item.name} from ${business.name || 'BizName'}`);
    const body = encodeURIComponent(
      `Hi ${client.name || 'there'},\n\nPlease find your invoice ${d.invoiceNumber || ''} for ${fmt(total)}.\n\n` +
      `You can view it here: ${window.location.href}\n\nThank you for your business!`
    );
    return `mailto:${client.email || ''}?subject=${subject}&body=${body}`;
  })();

  return (
    <div className="bn-container bn-invoice-details-page" style={{ maxWidth: 900, margin: 0, padding: 0 }}>
      <SEO title={`Invoice ${d.invoiceNumber || item.name}`} description="Invoice details." path={`/invoice/${id}`} />

      <div className="bn-invoice-details-toolbar bn-print-hide">
        <Link to="/saved-items?type=invoice" className="bn-invoice-back-link">
          <i className="fa-solid fa-arrow-left" /> Back to Invoices
        </Link>
        <div className="bn-invoice-toolbar-actions">
          <button onClick={handleShare} type="button"><i className="fa-solid fa-share-nodes" /> Share</button>
          <button onClick={handlePrint} type="button"><i className="fa-solid fa-download" /> Download</button>
          <a href={mailtoHref} className="bn-invoice-send-btn">
            <i className="fa-solid fa-paper-plane" /> Send Invoice
          </a>
        </div>
      </div>

      <div className="bn-invoice-sheet">
        <div className="bn-invoice-sheet-head">
          <div>
            <h1>Invoice <span className={`bn-badge bn-badge-${status}`}>{d.status || 'Pending'}</span></h1>
            <p className="bn-invoice-number">{d.invoiceNumber || item.name}</p>
          </div>
          <div className="bn-invoice-business">
            {business.name && <p className="bn-invoice-business-name">{business.name}</p>}
            {business.address && <p>{business.address}</p>}
            {business.phone && <p>{business.phone}</p>}
            {business.email && <p>{business.email}</p>}
          </div>
        </div>

        <div className="bn-invoice-meta-row">
          <div>
            <h4>Billed To</h4>
            <p className="bn-invoice-customer-name">{client.name || 'Customer'}</p>
            {client.address && <p>{client.address}</p>}
            {client.email && <p>{client.email}</p>}
            {client.phone && <p>{client.phone}</p>}
          </div>
          <div className="bn-invoice-dates">
            {d.invoiceDate && <p><strong>Invoice Date:</strong> {d.invoiceDate}</p>}
            {d.dueDate && <p><strong>Due Date:</strong> {d.dueDate}</p>}
            <p><strong>Payment Method:</strong> {d.paymentMethod || 'Not specified'}</p>
          </div>
        </div>

        <table className="bn-invoice-items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className="bn-table-empty">No line items recorded.</td></tr>
            ) : (
              items.map((it, i) => (
                <tr key={i}>
                  <td>{it.description || 'Item'}</td>
                  <td>{it.qty || 1}</td>
                  <td>{fmt(it.price)}</td>
                  <td>{fmt(Number(it.qty || 0) * Number(it.price || 0))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="bn-invoice-totals">
          <div className="bn-invoice-totals-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
          {Number(d.discount || 0) > 0 && (
            <div className="bn-invoice-totals-row"><span>Discount ({d.discount}%)</span><span>-{fmt(discountAmount)}</span></div>
          )}
          {Number(d.taxRate || 0) > 0 && (
            <div className="bn-invoice-totals-row"><span>VAT ({d.taxRate}%)</span><span>{fmt(taxAmount)}</span></div>
          )}
          <div className="bn-invoice-totals-row bn-invoice-totals-grand"><span>Total</span><span>{fmt(total)}</span></div>
        </div>

        {d.notes && (
          <div className="bn-invoice-notes">
            <h4>Notes</h4>
            <p>{d.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
