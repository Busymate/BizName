// Small inline SVG line chart — no charting library dependency needed
// for a single 7-point weekly line. Takes `days` from
// lib/usageStats.js's getUsageOverview() (`[{ label, count }]`, oldest
// first) so this always draws exactly what the KPI cards above it are
// counting from.
export default function UsageChart({ days = [] }) {
  const width = 560;
  const height = 160;
  const padX = 28;
  const padY = 18;

  const max = Math.max(1, ...days.map((d) => d.count));
  const stepX = days.length > 1 ? (width - padX * 2) / (days.length - 1) : 0;

  const points = days.map((d, i) => {
    const x = padX + i * stepX;
    const y = height - padY - (d.count / max) * (height - padY * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1]?.x || padX},${height - padY} L${padX},${height - padY} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="bn-usage-chart" role="img" aria-label="Weekly usage trend">
      <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="var(--bn-border)" strokeWidth="1" />
      {points.length > 1 && (
        <>
          <path d={areaPath} fill="var(--bn-primary-soft)" stroke="none" />
          <path d={linePath} fill="none" stroke="var(--bn-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="var(--bn-primary)" />
          <text x={p.x} y={height - 2} textAnchor="middle" fontSize="10" fill="var(--bn-text-secondary)">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}
