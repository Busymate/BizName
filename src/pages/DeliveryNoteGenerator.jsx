import DocumentGeneratorPage from '../components/DocumentGeneratorPage';
import '../styles/DeliveryNoteGenerator.css';

export default function DeliveryNoteGenerator() {
  return (
    <DocumentGeneratorPage
      slug="delivery-note-generator"
      title="Delivery Note Generator"
      description="Create professional delivery notes in seconds. Fast, simple and easy."
      docLabel="Delivery Note"
      itemLabel="Item Description"
      showPricing={false}
    />
  );
}
