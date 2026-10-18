import { describe, expect, it } from 'vitest';
import { countSeeded, seedTargetTree } from '../src/main/seed/targetTree';
import { insertTestProfile, makeTestDb } from './helpers/db';

describe('seedTargetTree', () => {
  it('seeds four subjects and the expected node count', () => {
    const db = makeTestDb();
    insertTestProfile(db);
    seedTargetTree(db, 'profile-test');
    expect(countSeeded(db, 'profile-test')).toEqual({
      subjects: 4,
      modules: 16,
      nodes: 47
    });
    db.close();
  });

  it('is idempotent', () => {
    const db = makeTestDb();
    insertTestProfile(db);
    seedTargetTree(db, 'profile-test');
    seedTargetTree(db, 'profile-test');
    expect(countSeeded(db, 'profile-test').subjects).toBe(4);
    db.close();
  });

  it('creates initial user state for every node', () => {
    const db = makeTestDb();
    insertTestProfile(db);
    seedTargetTree(db, 'profile-test');
    const row = db
      .prepare('SELECT COUNT(*) AS c FROM user_node_state WHERE profile_id = ?')
      .get('profile-test') as { c: number };
    expect(row.c).toBe(47);
    db.close();
  });
});
