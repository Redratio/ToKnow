import type Database from 'better-sqlite3';
import type { Profile } from '../../shared/types';
import { mapProfile, type ProfileRow } from '../db/rows';

export function insertProfile(
  db: Database.Database,
  profile: Profile,
  deviceId = 'local'
): Profile {
  const now = Date.now();
  db.prepare(
    `INSERT INTO study_profile
      (id, name, exam_date, daily_capacity_min, timezone, active,
       created_at, updated_at, deleted_at, device_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  ).run(
    profile.id,
    profile.name,
    profile.examDate,
    profile.dailyCapacityMin,
    profile.timezone,
    profile.active ? 1 : 0,
    now,
    now,
    deviceId
  );
  return profile;
}

export function getActiveProfile(db: Database.Database): Profile | null {
  const row = db
    .prepare(
      `SELECT * FROM study_profile
       WHERE active = 1 AND deleted_at IS NULL
       ORDER BY created_at DESC LIMIT 1`
    )
    .get() as ProfileRow | undefined;
  return row ? mapProfile(row) : null;
}
