import GenericQrPage from '../components/GenericQrPage';

export default function BarcodeGenerator() {
  return (
    <GenericQrPage
      slug="barcode-generator"
      title="Barcode Generator"
      description="Create Code 128 barcodes for your products instantly."
      kind="barcode"
      fields={[{ key: 'data', label: 'Product Code / SKU', default: '123456789012', placeholder: 'Enter product code' }]}
      buildPayload={({ data }) => data || ''}
    />
  );
}
