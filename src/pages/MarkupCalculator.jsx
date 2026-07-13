import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function MarkupCalculator() {
  return (
    <GenericCalculatorPage
      slug="markup-calculator"
      title="Markup Calculator"
      description="Calculate markup amount and selling price easily."
      fields={[
        { key: 'cost', label: 'Cost Price (₦)', default: 10000 },
        { key: 'markupPct', label: 'Markup %', default: 25 },
      ]}
      formatValue={(n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
      compute={({ cost, markupPct }) => {
        const markupAmount = (Number(cost || 0) * Number(markupPct || 0)) / 100;
        const sellingPrice = Number(cost || 0) + markupAmount;
        return {
          highlight: { label: 'Selling Price', value: sellingPrice },
          rows: [
            { label: 'Cost Price', value: Number(cost || 0) },
            { label: `Markup (${markupPct}%)`, value: markupAmount },
          ],
        };
      }}
    />
  );
}
