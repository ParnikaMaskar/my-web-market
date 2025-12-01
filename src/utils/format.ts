export function formatNumber(num: number | string) {
  if (!num) return "0";
  return Number(num).toLocaleString("en-IN"); // Indian grouping
}