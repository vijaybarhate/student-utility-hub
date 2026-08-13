/**
 * formatPercent(value, decimals = 1) — formats a number as a percentage
 * string with a fixed decimal count, e.g. `75` -> `75.0%`.
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * formatDays(n) — human countdown label for a day count:
 * `0`/negatives -> `today`, `1` -> `1 day`, anything else -> `N days`.
 */
export function formatDays(n: number): string {
  const rounded = Math.round(n);
  if (rounded <= 0) return 'today';
  if (rounded === 1) return '1 day';
  return `${rounded} days`;
}
