import GenericQrPage from '../components/GenericQrPage';

export default function WhatsappQrGenerator() {
  return (
    <GenericQrPage
      slug="whatsapp-qr-generator"
      title="WhatsApp QR Code Generator"
      description="Create a WhatsApp QR code so customers can message you instantly."
      fields={[
        { key: 'phone', label: 'WhatsApp Number (with country code)', default: '', placeholder: 'e.g. 2348001234567' },
        { key: 'message', label: 'Pre-filled Message (Optional)', default: '', placeholder: 'Hi, I would like to know more...' },
      ]}
      buildPayload={({ phone, message }) => (phone ? `https://wa.me/${phone.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}` : '')}
    />
  );
}
