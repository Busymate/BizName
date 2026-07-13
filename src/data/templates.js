// Local template catalog for the Templates page. `toolSlug` links a template
// card to the live generator tool that produces that document type.
import invoice from '../assets/invoice.jpeg';
import receipt from '../assets/receipt.jpeg';
import quotation from '../assets/quotation.jpeg';
import business from '../assets/business.jpeg';
import purchase from '../assets/purchase.jpeg';
import delivery from '../assets/delivery.jpeg';
import estimate from '../assets/estimate.jpeg';
import expense from '../assets/expense.jpeg';
import timesheet from '../assets/timesheet.jpeg';
import proposal from '../assets/project.jpeg';

const templates = [
  {image: invoice, slug: 'modern-invoice-template', name: 'Modern Invoice Template', category: 'Invoices', description: 'Clean and professional invoice template for any business.', toolSlug: 'invoice-generator', formats: ['Excel', 'Word', 'PDF'] },
  {image: receipt, slug: 'classic-receipt-template', name: 'Receipt Template', category: 'Receipts', description: 'Simple receipt template for daily transactions.', toolSlug: 'receipt-generator', formats: ['Excel', 'Word', 'PDF'] },
  {image: quotation, slug: 'quotation-template', name: 'Quotation Template', category: 'Quotes & Estimates', description: 'Create professional quotes that win more clients.', toolSlug: 'quotation-generator', formats: ['Excel', 'Word', 'PDF'] },
  {image: business, slug: 'business-plan-template', name: 'Business Plan Template', category: 'Business Plans', description: 'Complete business plan template for startups.', toolSlug: null, formats: ['Word', 'PDF'] },
  {image: purchase, slug: 'purchase-order-template', name: 'Purchase Order Template', category: 'Business Documents', description: 'Professional purchase order template for your business.', toolSlug: null, formats: ['Excel', 'Word', 'PDF'] },
  {image: delivery, slug: 'delivery-note-template', name: 'Delivery Note Template', category: 'Business Documents', description: 'Track and document deliveries easily.', toolSlug: 'delivery-note-generator', formats: ['Excel', 'Word', 'PDF'] },
  {image: estimate, slug: 'estimate-template', name: 'Estimate Template', category: 'Quotes & Estimates', description: 'Provide accurate estimates that build trust.', toolSlug: 'estimate-generator', formats: ['Excel', 'Word', 'PDF'] },
  {image: expense, slug: 'expense-report-template', name: 'Expense Report Template', category: 'Finance & Accounting', description: 'Track and report business expenses professionally.', toolSlug: null, formats: ['Excel', 'Word', 'PDF'] },
  {image: timesheet, slug: 'timesheet-template', name: 'Timesheet Template', category: 'HR & Payroll', description: 'Easily track work hours and employee productivity.', toolSlug: null, formats: ['Excel', 'Word', 'PDF'] },
  {image: proposal, slug: 'project-proposal-template', name: 'Project Proposal Template', category: 'Proposals & Contracts', description: 'Win more projects with a winning proposal.', toolSlug: null, formats: ['Word', 'PDF'] },
];

export const templateCategories = [...new Set(templates.map((t) => t.category))];

export function getTemplateBySlug(slug) {
  return templates.find((t) => t.slug === slug);
}

export default templates;
