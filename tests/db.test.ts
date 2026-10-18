import { describe, expect, it } from 'vitest';
import { migrate } from '../src/main/db/migrate';
import { makeTestDb, insertTestProfile } from './helpers/db';

describe('database migration', () => {
  it('creates all P0 tables', () => {
    const db = makeTestDb();
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[];
    const names = tables.map((t) => t.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'study_profile',
        'subject',
        'module',
        'knowledge_node',
        'node_prerequisite',
        'user_node_state',
        'task',
        'task_node',
        'evidence',
        'daily_log',
        'setting',
        'sync_outbox'
      ])
    );
    db.close();
  });

  it('gives every syncable entity its audit columns', () => {
    const db = makeTestDb();
    const required = ['id', 'created_at', 'updated_at', 'deleted_at', 'device_id'];
    const tables = [
      'study_profile',
      'subject',
      'module',
      'knowledge_node',
      'task',
      'daily_log'
    ];
    for (const table of tables) {
      const columns = db
        .prepare(`PRAGMA table_info(${table})`)
        .all() as { name: string }[];
      const names = columns.map((column) => column.name);
      for (const column of required) {
        expect(names, `${table}.${column}`).toContain(column);
      }
    }
    db.close();
  });

  it('is idempotent', () => {
    const db = makeTestDb();
    expect(() => migrate(db)).not.toThrow();
    db.close();
  });

  it('stores and reads a profile', () => {
    const db = makeTestDb();
    insertTestProfile(db);
    const row = db.prepare('SELECT * FROM study_profile WHERE id = ?').get('profile-test') as {
      name: string;
      exam_date: string;
    };
    expect(row.name).toBe('测试用户');
    expect(row.exam_date).toBe('2026-12-19');
    db.close();
  });
});
