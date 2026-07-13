import GenericCalculatorPage from '../components/GenericCalculatorPage';

export default function AttendanceCalculator() {
  return (
    <GenericCalculatorPage
      slug="attendance-calculator"
      title="Attendance Calculator"
      description="Track attendance summary and percentage."
      fields={[
        { key: 'totalDays', label: 'Total Working Days', default: 22 },
        { key: 'daysPresent', label: 'Days Present', default: 20 },
      ]}
      formatValue={(n) => (typeof n === 'number' && n <= 100 ? `${n.toFixed(1)}%` : `${n}`)}
      compute={({ totalDays, daysPresent }) => {
        const attendancePct = totalDays > 0 ? (Number(daysPresent || 0) / Number(totalDays)) * 100 : 0;
        const absentDays = Math.max(0, Number(totalDays || 0) - Number(daysPresent || 0));
        return {
          highlight: { label: 'Attendance Rate', value: attendancePct },
          rows: [
            { label: 'Days Present', value: Number(daysPresent || 0) },
            { label: 'Days Absent', value: absentDays },
          ],
        };
      }}
    />
  );
}
