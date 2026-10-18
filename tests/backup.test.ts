import Database from 'better-sqlite3';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDb } from '../src/main/db/connection';
import { upsertDailyLog } from '../src/main/repositories/dailyLogRepo';
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

  it('never exports journal notes, but the database copy keeps them', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'toknow-'));
    const db = createDb(path.join(dir, 'toknow.db'));
    insertTestProfile(db);
    upsertDailyLog(
      db,
      'profile-test',
      {
        date: '2026-10-18',
        sleepHours: 7,
        energy: 4,
        mood: 3,
        focusSelf: 4,
        note: '今天很焦虑'
      },
      Date.parse('2026-10-18T22:00:00+08:00')
    );

    const result = await exportBackup(db, dir, new Date('2026-10-18T22:30:00+08:00'));
    const raw = readFileSync(result.jsonPath, 'utf8');
    const json = JSON.parse(raw) as { dailyLogs: { note: string | null }[] };
    expect(json.dailyLogs[0].note).toBeNull();
    expect(raw).not.toContain('今天很焦虑');
    db.close();

    const copy = new Database(result.dbPath, { readonly: true });
    const row = copy
      .prepare('SELECT note FROM daily_log WHERE profile_id = ?')
      .get('profile-test') as { note: string | null };
    expect(row.note).toBe('今天很焦虑');
    copy.close();
  });
});
