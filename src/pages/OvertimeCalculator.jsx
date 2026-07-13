import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function OvertimeCalculator() {
  return (
    <GenericCalculatorPage
      slug="overtime-calculator"
      title="Overtime Calculator"
      description="Calculate overtime pay based on hourly rate and hours worked."
      fields={[
        { key: 'hourlyRate', label: 'Hourly Rate (₦)', default: 2500 },
        { key: 'overtimeHours', label: 'Overtime Hours', default: 8 },
        { key: 'multiplier', label: 'Overtime Multiplier', default: 1.5 },
      ]}
      formatValue={(n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
      compute={({ hourlyRate, overtimeHours, multiplier }) => {
        const overtimeRate = Number(hourlyRate || 0) * Number(multiplier || 1);
        const overtimePay = overtimeRate * Number(overtimeHours || 0);
        return {
          highlight: { label: 'Overtime Pay', value: overtimePay },
          rows: [
            { label: 'Overtime Rate (per hour)', value: overtimeRate },
            { label: 'Overtime Hours', value: Number(overtimeHours || 0) },
          ],
        };
      }}
    />
  );
}
