import GenericQrPage from '../components/GenericQrPage';

export default function QrCodeGenerator() {
  return (
    <GenericQrPage
      slug="qr-code-generator"
      title="QR Code Generator"
      description="Generate QR codes for any text, link or data instantly."
      fields={[{ key: 'data', label: 'Text or URL', default: 'https://bizname.com.ng', placeholder: 'Enter text or a link' }]}
      buildPayload={({ data }) => data || ''}
    />
  );
}
