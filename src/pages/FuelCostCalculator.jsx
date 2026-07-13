import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function FuelCostCalculator() {
  return (
    <GenericCalculatorPage
      slug="fuel-cost-calculator"
      title="Fuel Cost Calculator"
      description="Calculate fuel cost for travel or delivery trips."
      fields={[
        { key: 'distance', label: 'Distance (km)', default: 120 },
        { key: 'consumption', label: 'Fuel Consumption (km per litre)', default: 10 },
        { key: 'pricePerLitre', label: 'Price per Litre (₦)', default: 950 },
      ]}
      formatValue={(n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
      compute={({ distance, consumption, pricePerLitre }) => {
        const litresNeeded = consumption > 0 ? Number(distance || 0) / Number(consumption) : 0;
        const totalCost = litresNeeded * Number(pricePerLitre || 0);
        return {
          highlight: { label: 'Total Fuel Cost', value: totalCost },
          rows: [
            { label: 'Litres Needed', value: litresNeeded.toFixed(1) },
            { label: 'Price per Litre', value: Number(pricePerLitre || 0) },
          ],
        };
      }}
    />
  );
}
