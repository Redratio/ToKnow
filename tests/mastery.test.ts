import { describe, expect, it } from 'vitest';
import { updateMastery } from '../src/shared/mastery';

describe('updateMastery', () => {
  it('moves toward performance and never leaves 0..5', () => {
    expect(updateMastery(2, 4, 3, 0.5)).toBe(2.5);
    expect(updateMastery(0, 0, 5, 1)).toBe(0);
    expect(updateMastery(5, 5, 0, 1)).toBe(5);
  });

  it('rounds to two decimals', () => {
    expect(updateMastery(1, 3.333, 3, 0.5)).toBeCloseTo(1.17, 2);
  });

  it('is stable when performance equals expectation', () => {
    expect(updateMastery(2.75, 3, 3, 0.8)).toBe(2.75);
  });
});
