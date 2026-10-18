import { describe, expect, it } from 'vitest';
import { EVIDENCE_ALPHA, updateMastery } from '../src/shared/mastery';

describe('EVIDENCE_ALPHA', () => {
  it('matches the design document weights by evidence type', () => {
    expect(EVIDENCE_ALPHA.real_exam).toBe(0.35);
    expect(EVIDENCE_ALPHA.practice).toBe(0.25);
    expect(EVIDENCE_ALPHA.self_test).toBe(0.2);
    expect(EVIDENCE_ALPHA.task_completion).toBe(0.1);
    expect(EVIDENCE_ALPHA.self_rating).toBe(0.15);
  });
});

describe('updateMastery', () => {
  it('stays put when performance equals the expected level', () => {
    expect(updateMastery(2, 0.4, EVIDENCE_ALPHA.task_completion)).toBe(2);
    expect(updateMastery(2.75, 0.55, 0.8)).toBe(2.75);
  });

  it('moves only a little for a single task completion', () => {
    expect(updateMastery(0, 1, EVIDENCE_ALPHA.task_completion)).toBe(0.1);
    expect(updateMastery(0, 1, EVIDENCE_ALPHA.real_exam)).toBe(0.35);
  });

  it('never leaves 0..5', () => {
    for (let current = 0; current <= 5; current += 0.5) {
      for (const performance of [0, 0.5, 1]) {
        const next = updateMastery(current, performance, EVIDENCE_ALPHA.real_exam);
        expect(next).toBeGreaterThanOrEqual(0);
        expect(next).toBeLessThanOrEqual(5);
      }
    }
  });

  it('rounds to two decimals', () => {
    expect(updateMastery(1, 0.6666, 0.5)).toBe(1.23);
  });
});
