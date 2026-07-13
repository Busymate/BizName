import GenericGeneratorPage from '../components/GenericGeneratorPage';

function slugifyTag(word) {
  return `#${word.replace(/[^a-zA-Z0-9]/g, '')}`;
}

function generateHashtags({ topic }) {
  const base = (topic || 'Business').split(/\s+/).filter(Boolean);
  const generic = ['Marketing', 'SmallBusiness', 'Entrepreneur', 'BusinessTips', 'Growth', 'Success', 'Startup', 'DigitalMarketing', 'BrandStrategy', 'BusinessOwner'];
  const combos = [];
  base.forEach((w) => combos.push(slugifyTag(w)));
  generic.forEach((w) => combos.push(slugifyTag(w)));
  base.forEach((w) => generic.slice(0, 3).forEach((g) => combos.push(slugifyTag(w + g))));
  return [...new Set(combos)].slice(0, 25);
}

export default function HashtagGenerator() {
  return (
    <GenericGeneratorPage
      slug="hashtag-generator"
      title="Hashtag Generator"
      description="Generate the best hashtags to increase reach and engagement on social media."
      fields={[
        { key: 'topic', label: 'Enter Your Topic', default: 'Digital Marketing Tips', placeholder: 'e.g. Digital Marketing Tips' },
        { key: 'platform', label: 'Platform', default: 'Instagram', type: 'select', options: [
          { value: 'Instagram', label: 'Instagram' },
          { value: 'TikTok', label: 'TikTok' },
          { value: 'Twitter', label: 'X / Twitter' },
          { value: 'Facebook', label: 'Facebook' },
        ] },
      ]}
      generate={generateHashtags}
    />
  );
}
