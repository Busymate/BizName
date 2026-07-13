import GenericGeneratorPage from '../components/GenericGeneratorPage';

const PREFIXES = ['Nova', 'Peak', 'Bright', 'Prime', 'Swift', 'True', 'Bold', 'Clear', 'Next', 'Pure'];
const SUFFIXES = ['Hub', 'Works', 'Labs', 'Solutions', 'Group', 'Studio', 'Collective', 'Co', 'Ventures', 'Partners'];

function generateNames({ keywords }) {
  const words = (keywords || 'Business').split(',').map((w) => w.trim()).filter(Boolean);
  const base = words[0] || 'Business';
  const results = [];
  for (let i = 0; i < 10; i++) {
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    const pattern = i % 3;
    if (pattern === 0) results.push(`${prefix}${base}`);
    else if (pattern === 1) results.push(`${base} ${suffix}`);
    else results.push(`${prefix} ${suffix}`);
  }
  return [...new Set(results)];
}

export default function BusinessNameGenerator() {
  return (
    <GenericGeneratorPage
      slug="business-name-generator"
      title="Business Name Generator"
      description="Generate unique and catchy business names in seconds."
      fields={[
        { key: 'keywords', label: 'Business Keywords', default: 'Tech, Solutions', placeholder: 'e.g. Tech, Solutions, Digital' },
        { key: 'category', label: 'Business Category', default: 'Technology', type: 'select', options: [
          { value: 'Technology', label: 'Technology' },
          { value: 'Retail', label: 'Retail' },
          { value: 'Food', label: 'Food & Beverage' },
          { value: 'Fashion', label: 'Fashion' },
          { value: 'Consulting', label: 'Consulting' },
        ] },
      ]}
      generate={generateNames}
    />
  );
}
