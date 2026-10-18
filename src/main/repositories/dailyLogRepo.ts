import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import type { DailyLog, DailyLogInput } from '../../shared/types';
import { mapDailyLog, type DailyLogRow } from '../db/rows';

function validate(input: DailyLogInput): void {
  const inRange = (v: number | null, min: number, max: number): boolean =>
    v === null || (Number.isFinite(v) && v >= min && v <= max);
  if (
    !inRange(input.sleepHours, 0, 24) ||
    !inRange(input.energy, 1, 5) ||
    !inRange(input.mood, 1, 5) ||
    !inRange(input.focusSelf, 1, 5)
  ) {
    throw new Error('INVALID_DAILY_LOG');
  }
}

export function upsertDailyLog(
  db: Database.Database,
  profileId: string,
  input: DailyLogInput,
  nowMs: number
): DailyLog {
  validate(input);

  const existing = getDailyLog(db, profileId, input.date);
  const id = existing?.id ?? randomUUID();

  db.prepare(
    `INSERT INTO daily_log
      (id, profile_id, date, sleep_hours, energy, mood, focus_self, note,
       checkin_at, created_at, updated_at, device_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(profile_id, date) DO UPDATE SET
       sleep_hours = excluded.sleep_hours,
       energy = excluded.energy,
       mood = excluded.mood,
       focus_self = excluded.focus_self,
       note = excluded.note,
       checkin_at = excluded.checkin_at,
       updated_at = excluded.updated_at`
  ).run(
    id,
    profileId,
    input.date,
    input.sleepHours,
    input.energy,
    input.mood,
    input.focusSelf,
    input.note ?? null,
    nowMs,
    nowMs,
    nowMs,
    'local'
  );

  return getDailyLog(db, profileId, input.date)!;
}

export function getDailyLog(
  db: Database.Database,
  profileId: string,
  date: string
): DailyLog | null {
  const row = db
    .prepare(
      'SELECT * FROM daily_log WHERE profile_id = ? AND date = ? AND deleted_at IS NULL'
    )
    .get(profileId, date) as DailyLogRow | undefined;
  return row ? mapDailyLog(row) : null;
}

/**
 * 读取某个 profile 在 `[from, to]` 日期区间（含端点）内的打卡记录。
 * 日期为 `YYYY-MM-DD`，按日期升序返回；软删除的行不返回。
 */
export function listDailyLogsBetween(
  db: Database.Database,
  profileId: string,
  from: string,
  to: string
): DailyLog[] {
  const rows = db
    .prepare(
      `SELECT * FROM daily_log
       WHERE profile_id = ? AND date >= ? AND date <= ? AND deleted_at IS NULL
       ORDER BY date`
    )
    .all(profileId, from, to) as DailyLogRow[];
  return rows.map(mapDailyLog);
}
