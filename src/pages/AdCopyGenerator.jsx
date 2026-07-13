import GenericGeneratorPage from '../components/GenericGeneratorPage';

function generateAdCopies({ product, audience, benefit }) {
  const p = product || 'your product';
  const a = audience || 'your customers';
  const b = benefit || 'a better experience';
  return [
    `Stay ahead. ${p} gives ${a} ${b} — built for real life. 100% worth it.`,
    `${a} deserve better. That's why we built ${p}. Get ${b} today.`,
    `Work smarter. ${p} delivers ${b} so ${a} can focus on what matters. Shop now.`,
  ];
}

export default function AdCopyGenerator() {
  return (
    <GenericGeneratorPage
      slug="ad-copy-generator"
      title="Ad Copy Generator"
      description="Create high-converting ad copy that grabs attention and drives action."
      fields={[
        { key: 'product', label: 'Product / Service', default: '', placeholder: 'e.g. Smart Water Bottle' },
        { key: 'audience', label: 'Target Audience', default: '', placeholder: 'e.g. Fitness Enthusiasts' },
        { key: 'benefit', label: 'Key Benefit', default: '', placeholder: 'e.g. Keeps water cold for 24 hours' },
        { key: 'tone', label: 'Tone of Voice', default: 'Motivational', type: 'select', options: [
          { value: 'Motivational', label: 'Motivational' },
          { value: 'Professional', label: 'Professional' },
          { value: 'Playful', label: 'Playful' },
        ] },
      ]}
      generate={generateAdCopies}
    />
  );
}
