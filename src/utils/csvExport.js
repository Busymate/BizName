// Plain CSV export — no library needed. Works for "Export CSV" and also
// covers "Export Excel" in practice: Excel opens .csv files natively, and
// a real .xlsx would mean adding a new dependency (SheetJS) purely for a
// slightly different file extension. If genuine multi-sheet/styled .xlsx
// output is ever needed, that's a deliberate follow-up, not this.
function escapeCsvCell(value) {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function exportRowsToCsv(filename, columns, rows) {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(typeof c.value === 'function' ? c.value(row) : row[c.value])).join(',')
  );
  // Leading BOM so Excel opens UTF-8 (₦, accented names, etc.) correctly
  // instead of mangling it — a common gotcha with plain CSV + Excel.
  const csv = '\uFEFF' + [header, ...lines].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
