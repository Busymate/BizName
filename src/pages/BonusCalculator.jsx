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
      compute={({ salary, bonusPct }) => {
        const bonus = (Number(salary || 0) * Number(bonusPct || 0)) / 100;
        const naira = (n) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        return {
          highlight: { label: 'Bonus Amount', value: naira(bonus) },
          rows: [
            { label: 'Annual Salary', value: naira(salary) },
            { label: 'Bonus Percentage', value: `${bonusPct}%` },
          ],
        };
      }}
    />
  );
}
