import type Database from 'better-sqlite3';
import { createDb } from '../../src/main/db/connection';

export function makeTestDb(): Database.Database {
  return createDb(':memory:');
}

export function insertTestProfile(db: Database.Database, id = 'profile-test'): void {
  const now = Date.now();
  db.prepare(
    `INSERT INTO study_profile
      (id, name, exam_date, daily_capacity_min, timezone, active,
       created_at, updated_at, deleted_at, device_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  ).run(id, '测试用户', '2026-12-19', 480, 'Asia/Shanghai', 1, now, now, 'test-device');
}
