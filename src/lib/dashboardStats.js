import { listSavedItemsBetween } from './savedItems';
import { listCustomers } from './customers';

// Sums payload.total for saved_items rows whose payload marks them Paid.
// "Profit" here is really "revenue from paid invoices" — this codebase
// has no expense/cost-of-goods model yet, so true profit (revenue minus
// costs) isn't computable from what's stored today. We label it clearly
// in the UI rather than pretend it's a full P&L figure.
function sumPaid(rows) {
  return rows.reduce((sum, row) => {
    const status = (row.payload?.status || '').toLowerCase();
    if (status !== 'paid') return sum;
    return sum + Number(row.payload?.total || 0);
  }, 0);
}

function pctChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getDashboardStats() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonthInvoices, lastMonthInvoices, thisMonthReceipts, lastMonthReceipts, customers, allInvoices] = await Promise.all([
    listSavedItemsBetween({ type: 'invoice', fromIso: startOfThisMonth.toISOString() }),
    listSavedItemsBetween({ type: 'invoice', fromIso: startOfLastMonth.toISOString(), toIso: startOfThisMonth.toISOString() }),
    listSavedItemsBetween({ type: 'receipt', fromIso: startOfThisMonth.toISOString() }),
    listSavedItemsBetween({ type: 'receipt', fromIso: startOfLastMonth.toISOString(), toIso: startOfThisMonth.toISOString() }),
    listCustomers(),
    // Far-enough-back window to catch overdue invoices from prior months
    // too, not just the current month's — a Pending invoice from two
    // months ago is still overdue today.
    listSavedItemsBetween({ type: 'invoice', fromIso: new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString() }),
  ]);

  const profitThisMonth = sumPaid(thisMonthInvoices) + sumPaid(thisMonthReceipts);
  const profitLastMonth = sumPaid(lastMonthInvoices) + sumPaid(lastMonthReceipts);

  const customersThisMonth = customers.filter((c) => c.created_at && new Date(c.created_at) >= startOfThisMonth).length;
  const customersBeforeThisMonth = customers.length - customersThisMonth;

  // There's no dedicated "Overdue" status in InvoiceGenerator (just
  // Pending/Paid) — an invoice is overdue if it's still Pending and its
  // due date has passed.
  const overdueInvoices = allInvoices.filter((r) => {
    const status = (r.payload?.status || '').toLowerCase();
    const due = r.payload?.dueDate;
    return status === 'pending' && due && new Date(due) < now;
  });
  const inactiveThreshold = new Date(now);
  inactiveThreshold.setDate(inactiveThreshold.getDate() - 60);
  const inactiveCustomers = customers.filter((c) => !c.last_purchase_at || new Date(c.last_purchase_at) < inactiveThreshold);

  return {
    invoices: {
      count: thisMonthInvoices.length,
      change: pctChange(thisMonthInvoices.length, lastMonthInvoices.length),
    },
    receipts: {
      count: thisMonthReceipts.length,
      change: pctChange(thisMonthReceipts.length, lastMonthReceipts.length),
    },
    profit: {
      total: profitThisMonth,
      change: pctChange(profitThisMonth, profitLastMonth),
    },
    customers: {
      total: customers.length,
      change: pctChange(customers.length, customersBeforeThisMonth),
    },
    overdueInvoices,
    inactiveCustomers,
    recentInvoiceRows: thisMonthInvoices,
    topCustomer: [...customers].sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))[0],
  };
}
