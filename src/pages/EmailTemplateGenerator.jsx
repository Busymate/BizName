import GenericGeneratorPage from '../components/GenericGeneratorPage';

function generateEmails({ purpose, audience, tone }) {
  const p = purpose || 'Welcome Email';
  const a = audience || 'New Customers';
  return [
    `Subject: Welcome to the family!\n\nHi [First Name],\n\nWe're thrilled to have you as part of our ${a.toLowerCase()}. This is a ${p.toLowerCase()} to help you get started.\n\nBest regards,\nThe Team`,
    `Subject: You're all set!\n\nHi [First Name],\n\nThanks for joining us. As one of our ${a.toLowerCase()}, you'll get updates, tips, and offers straight to your inbox.\n\nCheers,\nThe Team`,
    `Subject: Let's get started\n\nHi [First Name],\n\nThis ${p.toLowerCase()} is written in a ${(tone || 'friendly').toLowerCase()} tone just for our ${a.toLowerCase()}. Explore what we have in store for you.\n\nWarm regards,\nThe Team`,
  ];
}

export default function EmailTemplateGenerator() {
  return (
    <GenericGeneratorPage
      slug="email-template-generator"
      title="Email Template Generator"
      description="Create professional email templates for any purpose in seconds."
      fields={[
        { key: 'purpose', label: 'Email Purpose', default: 'Welcome Email', type: 'select', options: [
          { value: 'Welcome Email', label: 'Welcome Email' },
          { value: 'Follow Up', label: 'Follow Up' },
          { value: 'Promotion', label: 'Promotion' },
          { value: 'Newsletter', label: 'Newsletter' },
        ] },
        { key: 'audience', label: 'Audience', default: 'New Customers', placeholder: 'e.g. New Customers' },
        { key: 'tone', label: 'Tone of Voice', default: 'Friendly', type: 'select', options: [
          { value: 'Friendly', label: 'Friendly' },
          { value: 'Professional', label: 'Professional' },
          { value: 'Casual', label: 'Casual' },
        ] },
      ]}
      generate={generateEmails}
    />
  );
}
