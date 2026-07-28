// Local template catalog for the Templates page. `toolSlug` links a
// template card to the live generator tool that produces that document
// type. Cards show an icon + color accent per category instead of a
// screenshot/image — matches how most professional template galleries
// (Canva, Notion, etc.) present a template before you open it, and
// avoids using placeholder images that aren't real previews of anything.
const CATEGORY_STYLE = {
  'Invoices': { icon: 'fa-file-invoice-dollar', color: '#2563eb' },
  'Receipts': { icon: 'fa-receipt', color: '#16a34a' },
  'Quotes & Estimates': { icon: 'fa-file-signature', color: '#7c3aed' },
  'Business Plans': { icon: 'fa-briefcase', color: '#c2410c' },
  'Business Documents': { icon: 'fa-folder-open', color: '#475569' },
  'Finance & Accounting': { icon: 'fa-chart-line', color: '#0d9488' },
  'HR & Payroll': { icon: 'fa-users', color: '#be185d' },
  'Proposals & Contracts': { icon: 'fa-file-contract', color: '#4338ca' },
};

const templates = [
  { slug: 'modern-invoice-template', name: 'Modern Invoice Template', category: 'Invoices', description: 'Clean and professional invoice template for any business.', toolSlug: 'invoice-generator', formats: ['Excel', 'Word', 'PDF'] },
  { slug: 'classic-receipt-template', name: 'Receipt Template', category: 'Receipts', description: 'Simple receipt template for daily transactions.', toolSlug: 'receipt-generator', formats: ['Excel', 'Word', 'PDF'] },
  { slug: 'quotation-template', name: 'Quotation Template', category: 'Quotes & Estimates', description: 'Create professional quotes that win more clients.', toolSlug: 'quotation-generator', formats: ['Excel', 'Word', 'PDF'] },
  { slug: 'business-plan-template', name: 'Business Plan Template', category: 'Business Plans', description: 'Complete business plan template for startups.', toolSlug: null, formats: ['Word', 'PDF'] },
  { slug: 'purchase-order-template', name: 'Purchase Order Template', category: 'Business Documents', description: 'Professional purchase order template for your business.', toolSlug: null, formats: ['Excel', 'Word', 'PDF'] },
  { slug: 'delivery-note-template', name: 'Delivery Note Template', category: 'Business Documents', description: 'Track and document deliveries easily.', toolSlug: 'delivery-note-generator', formats: ['Excel', 'Word', 'PDF'] },
  { slug: 'estimate-template', name: 'Estimate Template', category: 'Quotes & Estimates', description: 'Provide accurate estimates that build trust.', toolSlug: 'estimate-generator', formats: ['Excel', 'Word', 'PDF'] },
  { slug: 'expense-report-template', name: 'Expense Report Template', category: 'Finance & Accounting', description: 'Track and report business expenses professionally.', toolSlug: null, formats: ['Excel', 'Word', 'PDF'] },
  { slug: 'timesheet-template', name: 'Timesheet Template', category: 'HR & Payroll', description: 'Easily track work hours and employee productivity.', toolSlug: null, formats: ['Excel', 'Word', 'PDF'] },
  { slug: 'project-proposal-template', name: 'Project Proposal Template', category: 'Proposals & Contracts', description: 'Win more projects with a winning proposal.', toolSlug: null, formats: ['Word', 'PDF'] },
].map((t) => ({ ...t, ...CATEGORY_STYLE[t.category] }));

export const templateCategories = [...new Set(templates.map((t) => t.category))];

export function getTemplateBySlug(slug) {
  return templates.find((t) => t.slug === slug);
}

export default templates;
