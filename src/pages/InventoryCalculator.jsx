import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function InventoryCalculator() {
  return (
    <GenericCalculatorPage
      slug="inventory-calculator"
      title="Inventory Calculator"
      description="Calculate the total value of your inventory."
      fields={[
        { key: 'units', label: 'Number of Units', default: 200 },
        { key: 'unitCost', label: 'Cost per Unit (₦)', default: 1500 },
        { key: 'unitsSold', label: 'Units Sold', default: 60 },
        { key: 'sellingPrice', label: 'Selling Price per Unit (₦)', default: 2500 },
      ]}
      formatValue={(n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
      compute={({ units, unitCost, unitsSold, sellingPrice }) => {
        const totalValue = Number(units || 0) * Number(unitCost || 0);
        const remainingUnits = Math.max(0, Number(units || 0) - Number(unitsSold || 0));
        const remainingValue = remainingUnits * Number(unitCost || 0);
        const revenueFromSold = Number(unitsSold || 0) * Number(sellingPrice || 0);
        return {
          highlight: { label: 'Total Inventory Value', value: totalValue },
          rows: [
            { label: 'Remaining Units', value: remainingUnits },
            { label: 'Remaining Inventory Value', value: remainingValue },
            { label: 'Revenue from Units Sold', value: revenueFromSold },
          ],
        };
      }}
    />
  );
}
