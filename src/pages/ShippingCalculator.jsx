import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function ShippingCalculator() {
  return (
    <GenericCalculatorPage
      slug="shipping-calculator"
      title="Shipping Calculator"
      description="Calculate shipping costs based on weight, distance and rate."
      fields={[
        { key: 'weight', label: 'Package Weight (kg)', default: 5 },
        { key: 'distance', label: 'Distance (km)', default: 100 },
        { key: 'ratePerKgKm', label: 'Rate per kg/km (₦)', default: 15 },
        { key: 'baseFee', label: 'Base Handling Fee (₦)', default: 500 },
      ]}
      formatValue={(n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
      compute={({ weight, distance, ratePerKgKm, baseFee }) => {
        const variableCost = Number(weight || 0) * Number(distance || 0) * Number(ratePerKgKm || 0) / 100;
        const total = variableCost + Number(baseFee || 0);
        return {
          highlight: { label: 'Total Shipping Cost', value: total },
          rows: [
            { label: 'Base Handling Fee', value: Number(baseFee || 0) },
            { label: 'Variable Cost (weight × distance × rate)', value: variableCost },
          ],
        };
      }}
    />
  );
}
