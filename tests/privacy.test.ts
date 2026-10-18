import { describe, expect, it } from 'vitest';
import { accessLevel, canRead } from '../src/shared/privacy';

describe('data access policy', () => {
  it('keeps reflection out of planning, ai and export', () => {
    expect(accessLevel('reflection', 'display')).toBe('full');
    expect(canRead('reflection', 'planning')).toBe(false);
    expect(canRead('reflection', 'ai')).toBe(false);
    expect(canRead('reflection', 'export')).toBe(false);
  });

  it('gives planning only aggregates of behavior', () => {
    expect(accessLevel('behavior', 'planning')).toBe('aggregate');
    expect(accessLevel('behavior', 'display')).toBe('full');
    expect(canRead('behavior', 'planning')).toBe(true);
  });

  it('only exposes confirmed derived profile items to planning and ai', () => {
    expect(accessLevel('derived_profile', 'planning')).toBe('confirmed');
    expect(accessLevel('derived_profile', 'ai')).toBe('confirmed');
    expect(accessLevel('knowledge', 'planning')).toBe('full');
  });

  it('gives ai only aggregate behavior, never raw events', () => {
    expect(accessLevel('behavior', 'ai')).toBe('aggregate');
    expect(canRead('behavior', 'ai')).toBe(true);
  });
});
