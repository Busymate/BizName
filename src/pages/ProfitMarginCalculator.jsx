import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function ProfitMarginCalculator() {
  return (
    <GenericCalculatorPage
      slug="profit-margin-calculator"
      title="Profit Margin Calculator"
      description="Calculate your profit margin from revenue and cost."
      fields={[
        { key: 'revenue', label: 'Selling Price / Revenue (₦)', default: 25000 },
        { key: 'cost', label: 'Cost Price (₦)', default: 15000 },
      ]}
      formatValue={(n) => (typeof n === 'number' && Math.abs(n) < 1000 ? `${n.toFixed(1)}%` : `₦${Number(n || 0).toLocaleString()}`)}
      compute={({ revenue, cost }) => {
        const profit = Number(revenue || 0) - Number(cost || 0);
        const margin = revenue > 0 ? (profit / Number(revenue)) * 100 : 0;
        const markup = cost > 0 ? (profit / Number(cost)) * 100 : 0;
        return {
          highlight: { label: 'Profit Margin', value: margin },
          rows: [
            { label: 'Profit Amount', value: profit },
            { label: 'Markup %', value: markup },
          ],
        };
      }}
    />
  );
}
