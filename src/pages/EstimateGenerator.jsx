import DocumentGeneratorPage from '../components/DocumentGeneratorPage';
import '../styles/EstimateGenerator.css';

export default function EstimateGenerator() {
  return (
    <DocumentGeneratorPage
      slug="estimate-generator"
      title="Estimate Generator"
      description="Create accurate project estimates and plan your jobs better."
      docLabel="Estimate"
      itemLabel="Task / Item"
      showPricing
    />
  );
}
