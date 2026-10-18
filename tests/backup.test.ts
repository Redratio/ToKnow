import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDb } from '../src/main/db/connection';
import { seedTargetTree } from '../src/main/seed/targetTree';
import { exportBackup } from '../src/main/services/backupService';
import { insertTestProfile } from './helpers/db';

describe('exportBackup', () => {
  it('writes a database copy and a json export', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'toknow-'));
    const db = createDb(path.join(dir, 'toknow.db'));
    insertTestProfile(db);
    seedTargetTree(db, 'profile-test');

    const result = await exportBackup(db, dir, new Date('2026-10-18T22:30:00+08:00'));
    expect(existsSync(result.dbPath)).toBe(true);
    expect(existsSync(result.jsonPath)).toBe(true);

    const json = JSON.parse(readFileSync(result.jsonPath, 'utf8')) as {
      profile: { name: string };
      subjects: unknown[];
    };
    expect(json.profile.name).toBe('测试用户');
    expect(json.subjects).toHaveLength(4);

    db.close();
  });
});
