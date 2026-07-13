import GenericQrPage from '../components/GenericQrPage';

export default function VcardQrGenerator() {
  return (
    <GenericQrPage
      slug="vcard-qr-generator"
      title="vCard QR Code Generator"
      description="Create a digital business card (vCard) and share your contact instantly."
      fields={[
        { key: 'name', label: 'Full Name', default: '', placeholder: 'Full Name' },
        { key: 'company', label: 'Company', default: '', placeholder: 'Company Name' },
        { key: 'phone', label: 'Phone', default: '', placeholder: '+1 234 567 8900' },
        { key: 'email', label: 'Email', default: '', placeholder: 'you@example.com' },
      ]}
      buildPayload={({ name, company, phone, email }) =>
        name
          ? `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${company || ''}\nTEL:${phone || ''}\nEMAIL:${email || ''}\nEND:VCARD`
          : ''
      }
    />
  );
}
