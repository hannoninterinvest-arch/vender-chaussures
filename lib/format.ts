export function formatTnd(amount: number) {
  return `${Number(amount).toLocaleString("fr-TN", { maximumFractionDigits: 2 })} DT`;
}
