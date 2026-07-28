import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function GratuityCalculator() {
  return (
    <GenericCalculatorPage
      slug="gratuity-calculator"
      title="Gratuity Calculator"
      description="Calculate gratuity amount based on years of service and last salary."
      fields={[
        { key: 'lastSalary', label: 'Last Monthly Salary (₦)', default: 300000 },
        { key: 'yearsOfService', label: 'Years of Service', default: 5 },
        { key: 'daysPerYear', label: 'Gratuity Days per Year', default: 15 },
      ]}
      compute={({ lastSalary, yearsOfService, daysPerYear }) => {
        const dailyRate = Number(lastSalary || 0) / 26;
        const gratuity = dailyRate * Number(daysPerYear || 0) * Number(yearsOfService || 0);
        const naira = (n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        return {
          highlight: { label: 'Gratuity Amount', value: naira(gratuity) },
          rows: [
            { label: 'Daily Rate', value: naira(dailyRate) },
            { label: 'Years of Service', value: Number(yearsOfService || 0) },
          ],
        };
      }}
    />
  );
}
