import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function UnitPriceCalculator() {
  return (
    <GenericCalculatorPage
      slug="unit-price-calculator"
      title="Unit Price Calculator"
      description="Find the price per unit instantly."
      fields={[
        { key: 'totalPrice', label: 'Total Price (₦)', default: 12000 },
        { key: 'quantity', label: 'Quantity / Units', default: 24 },
      ]}
      formatValue={(n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
      compute={({ totalPrice, quantity }) => {
        const unitPrice = quantity > 0 ? Number(totalPrice || 0) / Number(quantity) : 0;
        return {
          highlight: { label: 'Price per Unit', value: unitPrice },
          rows: [
            { label: 'Total Price', value: Number(totalPrice || 0) },
            { label: 'Quantity', value: Number(quantity || 0) },
          ],
        };
      }}
    />
  );
}
