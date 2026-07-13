import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function RoiCalculator() {
  return (
    <GenericCalculatorPage
      slug="roi-calculator"
      title="ROI Calculator"
      description="Calculate your Return on Investment and measure project profitability."
      fields={[
        { key: 'investment', label: 'Initial Investment (₦)', default: 5000000 },
        { key: 'revenue', label: 'Total Revenue (₦)', default: 12000000 },
        { key: 'expenses', label: 'Total Expenses (₦)', default: 5500000 },
      ]}
      formatValue={(n) => (typeof n === 'number' && n < 1000 ? `${n.toFixed(1)}%` : `₦${Number(n || 0).toLocaleString()}`)}
      compute={({ investment, revenue, expenses }) => {
        const netProfit = Number(revenue || 0) - Number(expenses || 0);
        const roi = investment > 0 ? (netProfit / Number(investment)) * 100 : 0;
        const totalReturn = netProfit + Number(investment || 0);
        return {
          highlight: { label: 'ROI', value: roi },
          rows: [
            { label: 'Net Profit', value: netProfit },
            { label: 'Total Return', value: totalReturn },
            { label: 'Initial Investment', value: Number(investment || 0) },
          ],
          note: roi >= 0 ? `An ROI of ${roi.toFixed(1)}% means you earn ₦${(roi / 100).toFixed(2)} for every ₦1.00 you invest.` : 'This investment is currently showing a loss.',
        };
      }}
    />
  );
}
