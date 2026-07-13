import DocumentGeneratorPage from '../components/DocumentGeneratorPage';
import '../styles/QuotationGenerator.css';

export default function QuotationGenerator() {
  return (
    <DocumentGeneratorPage
      slug="quotation-generator"
      title="Quotation Generator"
      description="Create professional quotations in seconds and win more business."
      docLabel="Quotation"
      itemLabel="Item Description"
      showPricing
    />
  );
}
