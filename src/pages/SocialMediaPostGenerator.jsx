import GenericGeneratorPage from '../components/GenericGeneratorPage';

function generatePosts({ brand, topic, platform }) {
  const b = brand || 'Your Business';
  const t = topic || 'our new product';
  const templates = [
    `🎉 Big news from ${b}! We're excited to share ${t}. Try it today and see the difference. #${platform || 'Business'}`,
    `Looking for a better way to grow? ${b} just launched ${t}. Simplify your workflow, boost results. 🚀`,
    `At ${b}, we believe in making things easier. That's why we built ${t}. Ready to get started?`,
    `Big things are happening at ${b}! ${t} is here — and it's built for people like you. 💡`,
  ];
  return templates;
}

export default function SocialMediaPostGenerator() {
  return (
    <GenericGeneratorPage
      slug="social-media-post-generator"
      title="Social Media Post Generator"
      description="Create engaging posts for all major social media platforms in seconds."
      fields={[
        { key: 'brand', label: 'Business / Brand Name', default: '', placeholder: 'Your Business Name' },
        { key: 'topic', label: 'Post Topic', default: '', placeholder: 'e.g. New Product Launch' },
        { key: 'platform', label: 'Platform', default: 'Instagram', type: 'select', options: [
          { value: 'Instagram', label: 'Instagram' },
          { value: 'Facebook', label: 'Facebook' },
          { value: 'Twitter', label: 'X / Twitter' },
          { value: 'LinkedIn', label: 'LinkedIn' },
        ] },
      ]}
      generate={generatePosts}
    />
  );
}
