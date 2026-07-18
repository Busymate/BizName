// Generates public/sitemap.xml from the same route list used by the app.
// Run with: node scripts/generate-sitemap.js  (after `npm install`)
// Re-run whenever a route is added/removed, or wire it into your
// `postbuild` npm script so it regenerates on every `npm run build`.

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://bizname.com.ng';

const staticRoutes = [
  '/', '/tools', '/templates', '/blog', '/business-tips', '/about',
  '/contact', '/privacy-policy', '/terms-of-service',
];

const toolRoutes = [
  'invoice-generator', 'receipt-generator', 'profit-calculator', 'vat-calculator',
  'discount-calculator', 'pricing-calculator', 'break-even-calculator', 'loan-calculator',
  'salary-calculator', 'tax-calculator', 'markup-calculator', 'currency-calculator',
  'business-name-generator', 'slogan-generator', 'swot-analysis', 'roi-calculator',
  'startup-cost-calculator', 'social-media-post-generator', 'hashtag-generator',
  'email-template-generator', 'ad-copy-generator', 'product-description-generator',
  'qr-code-generator', 'whatsapp-qr-generator', 'vcard-qr-generator', 'url-qr-generator',
  'barcode-generator', 'shipping-calculator', 'profit-margin-calculator',
  'sales-tax-calculator', 'inventory-calculator', 'unit-price-calculator',
  'leave-calculator', 'overtime-calculator', 'attendance-calculator',
  'gratuity-calculator', 'bonus-calculator', 'unit-converter', 'date-calculator',
  'time-calculator', 'fuel-cost-calculator', 'age-calculator', 'quotation-generator',
  'estimate-generator', 'delivery-note-generator',
].map((slug) => `/${slug}`);

const allRoutes = [...staticRoutes, ...toolRoutes];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}${route}</loc>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), xml);
console.log(`Sitemap generated with ${allRoutes.length} URLs at public/sitemap.xml`);
