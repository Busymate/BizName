// Single source of truth for every tool in the app: used by the Tools page,
// Home page "Popular Tools", search, sidebar categories, and routing.
// icon = Font Awesome class suffix (used as `fa-solid fa-${icon}`)
//
// To use a real image/icon file instead of the Font Awesome icon for any
// tool, add `iconImage: '/icons/invoice.svg'` to that tool's entry below.
// Drop the actual file in /public/icons/invoice.svg (anything under
// /public/ is served from the site root), and ToolCard will automatically
// render the <img> instead of the icon font — no other code changes
// needed. Leave `iconImage` out to keep using the Font Awesome icon.

const tools = [
  // Financial Tools
  { slug: 'profit-calculator', name: 'Profit Calculator', category: 'Financial Tools', icon: 'chart-line', description: 'Calculate profit, cost and profit margin instantly.' },
  { slug: 'vat-calculator', name: 'VAT Calculator', category: 'Financial Tools', icon: 'percent', description: 'Calculate VAT amount and total price.' },
  { slug: 'discount-calculator', name: 'Discount Calculator', category: 'Financial Tools', icon: 'tags', description: 'Find final price after discount.' },
  { slug: 'pricing-calculator', name: 'Pricing Calculator', category: 'Financial Tools', icon: 'money-bill-wave', description: 'Set the right price and maximize profit.' },
  { slug: 'break-even-calculator', name: 'Break-even Calculator', category: 'Financial Tools', icon: 'balance-scale', description: 'Calculate your break-even point easily.' },
  { slug: 'loan-calculator', name: 'Loan Calculator', category: 'Financial Tools', icon: 'landmark', description: 'Calculate loan EMI and interest.' },
  { slug: 'salary-calculator', name: 'Salary Calculator', category: 'Financial Tools', icon: 'wallet', description: 'Calculate net salary and deductions.' },
  { slug: 'tax-calculator', name: 'Tax Calculator', category: 'Financial Tools', icon: 'file-invoice-dollar', description: 'Estimate taxes accurately.' },
  { slug: 'markup-calculator', name: 'Markup Calculator', category: 'Financial Tools', icon: 'tag', description: 'Add markup and calculate price.' },
  { slug: 'currency-calculator', name: 'Currency Converter', category: 'Financial Tools', icon: 'money-bill-transfer', description: 'Convert between currencies.' },
  { slug: 'roi-calculator', name: 'ROI Calculator', category: 'Financial Tools', icon: 'chart-pie', description: 'Calculate return on investment.' },
  { slug: 'startup-cost-calculator', name: 'Startup Cost Calculator', category: 'Financial Tools', icon: 'rocket', description: 'Estimate startup costs easily.' },

  // Invoice & Documents
  { slug: 'invoice-generator', name: 'Invoice Generator', category: 'Invoice & Documents', icon: 'file-invoice', description: 'Create professional invoices in seconds.' },
  { slug: 'receipt-generator', name: 'Receipt Generator', category: 'Invoice & Documents', icon: 'receipt', description: 'Generate receipts instantly.' },
  { slug: 'quotation-generator', name: 'Quotation Generator', category: 'Invoice & Documents', icon: 'file-signature', description: 'Create quotes for your customers.' },
  { slug: 'estimate-generator', name: 'Estimate Generator', category: 'Invoice & Documents', icon: 'calculator', description: 'Make accurate estimates quickly.' },
  { slug: 'delivery-note-generator', name: 'Delivery Note Generator', category: 'Invoice & Documents', icon: 'truck', description: 'Generate delivery notes easily.' },

  // Business Planning
  { slug: 'business-name-generator', name: 'Business Name Generator', category: 'Business Planning', icon: 'lightbulb', description: 'Generate unique business names.' },
  { slug: 'slogan-generator', name: 'Slogan Generator', category: 'Business Planning', icon: 'bullhorn', description: 'Create catchy slogans for your brand.' },
  { slug: 'swot-analysis', name: 'SWOT Analysis Tool', category: 'Business Planning', icon: 'th-large', description: 'Analyze strengths, weaknesses, opportunities & threats.' },

  // Marketing Tools
  { slug: 'social-media-post-generator', name: 'Social Media Post Generator', category: 'Marketing Tools', icon: 'share-nodes', description: 'Generate post ideas for social media.' },
  { slug: 'hashtag-generator', name: 'Hashtag Generator', category: 'Marketing Tools', icon: 'hashtag', description: 'Find the best hashtags for your posts.' },
  { slug: 'email-template-generator', name: 'Email Template Generator', category: 'Marketing Tools', icon: 'envelope', description: 'Professional email templates for your business.' },
  { slug: 'ad-copy-generator', name: 'Ad Copy Generator', category: 'Marketing Tools', icon: 'ad', description: 'Create engaging ad copies.' },
  { slug: 'product-description-generator', name: 'Product Description Generator', category: 'Marketing Tools', icon: 'box', description: 'Write product descriptions fast.' },

  // QR & Barcode Tools
  { slug: 'qr-code-generator', name: 'QR Code Generator', category: 'QR & Barcode Tools', icon: 'qrcode', description: 'Generate QR codes instantly.' },
  { slug: 'whatsapp-qr-generator', name: 'WhatsApp QR Code', category: 'QR & Barcode Tools', icon: 'whatsapp', iconPrefix: 'fa-brands', description: 'Create WhatsApp QR code.' },
  { slug: 'vcard-qr-generator', name: 'vCard QR Code', category: 'QR & Barcode Tools', icon: 'address-card', description: 'Share contact info with QR.' },
  { slug: 'url-qr-generator', name: 'URL QR Code', category: 'QR & Barcode Tools', icon: 'link', description: 'Generate QR for any website.' },
  { slug: 'barcode-generator', name: 'Barcode Generator', category: 'QR & Barcode Tools', icon: 'barcode', description: 'Create barcodes for products.' },

  // Online Selling Tools
  { slug: 'shipping-calculator', name: 'Shipping Calculator', category: 'Online Selling Tools', icon: 'shipping-fast', description: 'Calculate shipping costs.' },
  { slug: 'profit-margin-calculator', name: 'Profit Margin Calculator', category: 'Online Selling Tools', icon: 'percentage', description: 'Calculate profit margin.' },
  { slug: 'sales-tax-calculator', name: 'Sales Tax Calculator', category: 'Online Selling Tools', icon: 'file-invoice-dollar', description: 'Calculate sales tax easily.' },
  { slug: 'inventory-calculator', name: 'Inventory Calculator', category: 'Online Selling Tools', icon: 'warehouse', description: 'Track inventory value.' },
  { slug: 'unit-price-calculator', name: 'Unit Price Calculator', category: 'Online Selling Tools', icon: 'weight-hanging', description: 'Find price per unit instantly.' },

  // HR & Payroll
  { slug: 'leave-calculator', name: 'Leave Calculator', category: 'HR & Payroll', icon: 'calendar-minus', description: 'Calculate leave and days balance.' },
  { slug: 'overtime-calculator', name: 'Overtime Calculator', category: 'HR & Payroll', icon: 'business-time', description: 'Calculate overtime pay.' },
  { slug: 'attendance-calculator', name: 'Attendance Calculator', category: 'HR & Payroll', icon: 'user-check', description: 'Track attendance summary.' },
  { slug: 'gratuity-calculator', name: 'Gratuity Calculator', category: 'HR & Payroll', icon: 'gift', description: 'Calculate gratuity amount.' },
  { slug: 'bonus-calculator', name: 'Bonus Calculator', category: 'HR & Payroll', icon: 'trophy', description: 'Calculate employee bonus.' },

  // Converters
  { slug: 'unit-converter', name: 'Unit Converter', category: 'Converters', icon: 'ruler-combined', description: 'Convert length, area, weight & more.' },
  { slug: 'date-calculator', name: 'Date Calculator', category: 'Converters', icon: 'calendar-days', description: 'Add or subtract dates.' },
  { slug: 'time-calculator', name: 'Time Calculator', category: 'Converters', icon: 'clock', description: 'Calculate time difference.' },
  { slug: 'fuel-cost-calculator', name: 'Fuel Cost Calculator', category: 'Converters', icon: 'gas-pump', description: 'Calculate fuel cost for travel.' },
  { slug: 'age-calculator', name: 'Age Calculator', category: 'Converters', icon: 'user-clock', description: 'Calculate age from date of birth.' },
];

export const categories = [...new Set(tools.map((t) => t.category))];

export function getToolBySlug(slug) {
  return tools.find((t) => t.slug === slug);
}

export default tools;
