import Database from 'better-sqlite3';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDb } from '../src/main/db/connection';
import { upsertDailyLog } from '../src/main/repositories/dailyLogRepo';
import { insertTask } from '../src/main/repositories/taskRepo';
import { seedTargetTree } from '../src/main/seed/targetTree';
import { exportBackup } from '../src/main/services/backupService';
import type { Task } from '../src/shared/types';
import { insertTestProfile } from './helpers/db';

function makeTask(overrides: Partial<Task> & Pick<Task, 'id' | 'profileId'>): Task {
  const nowMs = Date.parse('2026-10-18T12:00:00+08:00');
  return {
    title: '任务',
    type: 'study',
    plannedMin: 30,
    actualMin: null,
    scheduledDate: '2026-10-18',
    status: 'todo',
    priorityScore: 0,
    isMainline: false,
    source: 'manual',
    locked: false,
    notes: null,
    createdAt: nowMs,
    updatedAt: nowMs,
    ...overrides
  };
}

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

  it('redacts task notes from the JSON export while the database copy keeps them', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'toknow-'));
    const db = createDb(path.join(dir, 'toknow.db'));
    insertTestProfile(db);
    insertTask(
      db,
      makeTask({
        id: 'task-note',
        profileId: 'profile-test',
        title: '有备注的任务',
        notes: 'SENTINEL_TASK_NOTE_7f3a'
      })
    );

    const result = await exportBackup(db, dir, new Date('2026-10-18T22:30:00+08:00'));
    const raw = readFileSync(result.jsonPath, 'utf8');
    const json = JSON.parse(raw) as { tasks: { id: string; notes: string | null }[] };
    expect(json.tasks).toHaveLength(1);
    expect(json.tasks[0].notes).toBeNull();
    expect(raw).not.toContain('SENTINEL_TASK_NOTE_7f3a');
    db.close();

    const copy = new Database(result.dbPath, { readonly: true });
    const row = copy
      .prepare('SELECT notes FROM task WHERE id = ?')
      .get('task-note') as { notes: string | null };
    expect(row.notes).toBe('SENTINEL_TASK_NOTE_7f3a');
    copy.close();
  });

  it('exports only the active profile tasks, states and daily logs', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'toknow-'));
    const db = createDb(path.join(dir, 'toknow.db'));
    insertTestProfile(db, 'profile-a');
    seedTargetTree(db, 'profile-a');
    db.prepare('UPDATE study_profile SET active = 0, created_at = 1 WHERE id = ?').run(
      'profile-a'
    );
    insertTestProfile(db, 'profile-b');
    db.prepare('UPDATE study_profile SET created_at = 2 WHERE id = ?').run(
      'profile-b'
    );

    insertTask(db, makeTask({ id: 'task-a', profileId: 'profile-a', title: 'A 的任务' }));
    insertTask(db, makeTask({ id: 'task-b', profileId: 'profile-b', title: 'B 的任务' }));
    db.prepare(
      `INSERT INTO user_node_state
        (profile_id, node_id, self_rating, mastery, confidence,
         last_studied_at, next_review_at, review_count, updated_by, updated_at)
       VALUES (?, ?, 0, 1, 0.5, NULL, NULL, 1, 'self', ?)`
    ).run('profile-b', 'node_0_0_0', Date.now());
    upsertDailyLog(
      db,
      'profile-a',
      { date: '2026-10-18', sleepHours: 7, energy: 3, mood: 3, focusSelf: 3, note: 'A 日记' },
      Date.now()
    );
    upsertDailyLog(
      db,
      'profile-b',
      { date: '2026-10-18', sleepHours: 6, energy: 4, mood: 4, focusSelf: 4, note: 'B 日记' },
      Date.now()
    );

    const result = await exportBackup(db, dir, new Date('2026-10-18T22:30:00+08:00'));
    const raw = readFileSync(result.jsonPath, 'utf8');
    const json = JSON.parse(raw) as {
      profile: { id: string };
      subjects: { code: string }[];
      nodes: { title: string }[];
      tasks: { id: string }[];
      states: { nodeId: string }[];
      dailyLogs: { note: string | null }[];
    };

    expect(json.profile.id).toBe('profile-b');
    // profile-a 的种子科目/节点不能泄漏到 profile-b 的导出里。
    expect(json.subjects).toHaveLength(0);
    expect(json.nodes).toHaveLength(0);
    expect(raw).not.toContain('高等数学');
    expect(raw).not.toContain('函数、极限与连续');
    expect(json.tasks.map((task) => task.id)).toEqual(['task-b']);
    expect(json.states).toHaveLength(1);
    expect(json.states[0].nodeId).toBe('node_0_0_0');
    expect(json.dailyLogs).toHaveLength(1);
    expect(json.dailyLogs[0].note).toBeNull();
    db.close();
  });
});
