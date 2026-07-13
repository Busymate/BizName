import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function BonusCalculator() {
  return (
    <GenericCalculatorPage
      slug="bonus-calculator"
      title="Bonus Calculator"
      description="Calculate employee bonus based on salary and performance percentage."
      fields={[
        { key: 'salary', label: 'Annual Salary (₦)', default: 4000000 },
        { key: 'bonusPct', label: 'Bonus Percentage (%)', default: 10 },
      ]}
      formatValue={(n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
      compute={({ salary, bonusPct }) => {
        const bonus = (Number(salary || 0) * Number(bonusPct || 0)) / 100;
        return {
          highlight: { label: 'Bonus Amount', value: bonus },
          rows: [
            { label: 'Annual Salary', value: Number(salary || 0) },
            { label: 'Bonus Percentage', value: `${bonusPct}%` },
          ],
        };
      }}
    />
  );
}
