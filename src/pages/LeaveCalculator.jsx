import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function LeaveCalculator() {
  return (
    <GenericCalculatorPage
      slug="leave-calculator"
      title="Leave Calculator"
      description="Calculate leave taken and remaining days balance."
      fields={[
        { key: 'totalLeave', label: 'Total Annual Leave Days', default: 21 },
        { key: 'daysUsed', label: 'Leave Days Used', default: 6 },
      ]}
      formatValue={(n) => `${Number(n || 0)} days`}
      compute={({ totalLeave, daysUsed }) => {
        const balance = Math.max(0, Number(totalLeave || 0) - Number(daysUsed || 0));
        const pctUsed = totalLeave > 0 ? (Number(daysUsed || 0) / Number(totalLeave)) * 100 : 0;
        return {
          highlight: { label: 'Leave Balance', value: balance },
          rows: [
            { label: 'Total Leave Days', value: Number(totalLeave || 0) },
            { label: 'Days Used', value: Number(daysUsed || 0) },
            { label: 'Percentage Used', value: `${pctUsed.toFixed(0)}%` },
          ],
        };
      }}
    />
  );
}
