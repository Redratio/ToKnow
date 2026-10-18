export type DataDomain =
  | 'knowledge'
  | 'behavior'
  | 'reflection'
  | 'derived_profile';

export type DataPurpose = 'planning' | 'display' | 'ai' | 'export';

export type AccessLevel = 'none' | 'aggregate' | 'redacted' | 'confirmed' | 'full';

const POLICY: Record<DataDomain, Record<DataPurpose, AccessLevel>> = {
  knowledge: {
    planning: 'full',
    display: 'full',
    ai: 'full',
    export: 'full'
  },
  behavior: {
    planning: 'aggregate',
    display: 'full',
    ai: 'aggregate',
    export: 'redacted'
  },
  reflection: {
    planning: 'none',
    display: 'full',
    ai: 'none',
    export: 'none'
  },
  derived_profile: {
    planning: 'confirmed',
    display: 'full',
    ai: 'confirmed',
    export: 'full'
  }
};

export function accessLevel(
  domain: DataDomain,
  purpose: DataPurpose
): AccessLevel {
  return POLICY[domain][purpose] ?? 'none';
}

export function canRead(domain: DataDomain, purpose: DataPurpose): boolean {
  return accessLevel(domain, purpose) !== 'none';
}
