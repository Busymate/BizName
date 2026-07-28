import GenericQrPage from '../components/GenericQrPage';

export default function UrlQrGenerator() {
  return (
    <GenericQrPage
      slug="url-qr-generator"
      title="URL QR Code Generator"
      description="Generate QR codes for any website or link. Scan to open instantly."
      fields={[{ key: 'url', label: 'Website URL', default: 'https://bizname.com.ng', placeholder: 'https://example.com' }]}
      buildPayload={({ url }) => url || ''}
    />
  );
}
