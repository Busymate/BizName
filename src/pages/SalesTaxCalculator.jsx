import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function SalesTaxCalculator() {
  return (
    <GenericCalculatorPage
      slug="sales-tax-calculator"
      title="Sales Tax Calculator"
      description="Calculate sales tax and total price easily."
      fields={[
        { key: 'amount', label: 'Sale Amount (₦)', default: 50000 },
        { key: 'taxRate', label: 'Sales Tax Rate (%)', default: 7.5 },
      ]}
      formatValue={(n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
      compute={({ amount, taxRate }) => {
        const taxAmount = (Number(amount || 0) * Number(taxRate || 0)) / 100;
        const total = Number(amount || 0) + taxAmount;
        return {
          highlight: { label: 'Total (Incl. Tax)', value: total },
          rows: [
            { label: 'Sale Amount', value: Number(amount || 0) },
            { label: `Sales Tax (${taxRate}%)`, value: taxAmount },
          ],
        };
      }}
    />
  );
}
