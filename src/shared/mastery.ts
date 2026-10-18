export type EvidenceKind =
  | 'real_exam'
  | 'practice'
  | 'self_test'
  | 'task_completion'
  | 'self_rating';

export const EVIDENCE_ALPHA: Record<EvidenceKind, number> = {
  real_exam: 0.35,
  practice: 0.25,
  self_test: 0.2,
  task_completion: 0.1,
  self_rating: 0.15
};

/**
 * 掌握度更新（设计文档 8.2）。
 * current 与返回值是 0–5；performance 是归一化到 0–1 的表现分。
 * 一次证据最多把掌握度推动 alpha 点，所以任务完成只是弱证据。
 */
export function updateMastery(
  current: number,
  performance: number,
  alpha: number
): number {
  const expected = current / 5;
  const next = current + alpha * (performance - expected);
  const clamped = Math.min(5, Math.max(0, next));
  return Math.round(clamped * 100) / 100;
}
