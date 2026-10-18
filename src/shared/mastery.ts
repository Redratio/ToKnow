export function updateMastery(
  current: number,
  performance: number,
  expected: number,
  weight: number
): number {
  const next = current + weight * (performance - expected);
  const clamped = Math.min(5, Math.max(0, next));
  return Math.round(clamped * 100) / 100;
}
