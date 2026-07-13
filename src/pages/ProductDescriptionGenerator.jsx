import GenericGeneratorPage from '../components/GenericGeneratorPage';

function generateDescriptions({ productName, features, usp }) {
  const p = productName || 'This product';
  const f = features || 'thoughtful design and quality materials';
  const u = usp || 'built to last';
  return [
    `${p} combines ${f} to deliver a genuinely better experience. It's ${u} — upgrade your everyday with confidence.`,
    `Meet ${p}. Featuring ${f}, it's designed for people who want more from what they buy. And it's ${u}.`,
    `Experience the difference with ${p}. With ${f}, this is one purchase you won't regret — ${u}.`,
  ];
}

export default function ProductDescriptionGenerator() {
  return (
    <GenericGeneratorPage
      slug="product-description-generator"
      title="Product Description Generator"
      description="Write compelling product descriptions that sell and build trust."
      fields={[
        { key: 'productName', label: 'Product Name', default: '', placeholder: 'e.g. Wireless Bluetooth Headphones' },
        { key: 'features', label: 'Key Features', default: '', type: 'textarea', placeholder: 'e.g. 40mm drivers, 30-hour battery, noise cancellation' },
        { key: 'usp', label: 'Unique Selling Point (Optional)', default: '', placeholder: 'e.g. Built to last, premium sound' },
      ]}
      generate={generateDescriptions}
    />
  );
}
