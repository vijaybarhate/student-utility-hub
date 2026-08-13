/**
 * gradeFor(percent) — maps a percentage to a letter grade.
 *
 * A+ ≥ 90, A ≥ 80, B+ ≥ 70, B ≥ 60, C ≥ 50, F < 50.
 * Pure logic so it can be unit-tested with plain Node.
 */
export function gradeFor(percent: number): string {
  if (percent >= 90) return 'A+';
  if (percent >= 80) return 'A';
  if (percent >= 70) return 'B+';
  if (percent >= 60) return 'B';
  if (percent >= 50) return 'C';
  return 'F';
}
