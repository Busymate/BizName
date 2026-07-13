// Simplified Nigerian PAYE tax bands, used by both the Salary Calculator
// and the Tax Calculator so the two tools always agree with each other.
// Rates are illustrative/estimation-only, as shown to the user in the UI.

const BANDS = [
  { upTo: 300000, rate: 0.07 },
  { upTo: 600000, rate: 0.11 },
  { upTo: 1100000, rate: 0.15 },
  { upTo: 1600000, rate: 0.19 },
  { upTo: 3200000, rate: 0.21 },
  { upTo: Infinity, rate: 0.24 },
];

export function calculatePAYE(taxableIncome) {
  let remaining = Math.max(0, Number(taxableIncome || 0));
  let lowerBound = 0;
  let totalTax = 0;
  const breakdown = [];

  for (const band of BANDS) {
    const bandSize = band.upTo - lowerBound;
    const taxableInBand = Math.min(remaining, bandSize);
    if (taxableInBand > 0) {
      const tax = taxableInBand * band.rate;
      totalTax += tax;
      breakdown.push({
        range: band.upTo === Infinity ? `Above ${lowerBound.toLocaleString()}` : `Next ${bandSize.toLocaleString()}`,
        rate: `${(band.rate * 100).toFixed(0)}%`,
        amount: tax,
      });
      remaining -= taxableInBand;
    }
    lowerBound = band.upTo;
    if (remaining <= 0) break;
  }

  return { totalTax, breakdown };
}
