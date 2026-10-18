import { describe, expect, it } from 'vitest';
import { daysBetween, getStudyDate } from '../src/shared/date';

describe('getStudyDate', () => {
  it('uses the same date before 4am', () => {
    const at3am = new Date(2026, 9, 19, 3, 30);
    expect(getStudyDate(at3am)).toBe('2026-10-18');
  });

  it('rolls over at 4am', () => {
    const at4am = new Date(2026, 9, 19, 4, 0);
    expect(getStudyDate(at4am)).toBe('2026-10-19');
  });

  it('handles month boundaries', () => {
    const at2am = new Date(2026, 10, 1, 2, 0);
    expect(getStudyDate(at2am)).toBe('2026-10-31');
  });
});

describe('daysBetween', () => {
  it('counts whole days', () => {
    expect(daysBetween('2026-10-18', '2026-12-19')).toBe(62);
  });

  it('never returns negative', () => {
    expect(daysBetween('2026-12-19', '2026-10-18')).toBe(0);
  });
});
