import GenericGeneratorPage from '../components/GenericGeneratorPage';

const TEMPLATES = [
  (n) => `${n}, Smarter Every Day.`,
  (n) => `Simplifying Business, Amplifying Success.`,
  (n) => `${n}: Your Business, Smarter.`,
  (n) => `Solutions That Drive Success.`,
  (n) => `Smart Today, Successful Tomorrow.`,
  (n) => `We Simplify, You Grow.`,
  (n) => `Better Solutions, Better Business.`,
  (n) => `Making ${n || 'Business'} Simple.`,
  (n) => `Smart Tools. Smart Business.`,
  (n) => `Your Success, Our Solution.`,
];

function generateSlogans({ businessName }) {
  return TEMPLATES.map((t) => t(businessName)).sort(() => Math.random() - 0.5);
}

export default function SloganGenerator() {
  return (
    <GenericGeneratorPage
      slug="slogan-generator"
      title="Slogan Generator"
      description="Create memorable slogans that make your brand stand out."
      fields={[
        { key: 'businessName', label: 'Business Name (Optional)', default: '', placeholder: 'Your Business Name' },
        { key: 'tone', label: 'Tone of Voice', default: 'Professional', type: 'select', options: [
          { value: 'Professional', label: 'Professional' },
          { value: 'Fun', label: 'Fun & Playful' },
          { value: 'Bold', label: 'Bold' },
        ] },
      ]}
      generate={generateSlogans}
    />
  );
}
