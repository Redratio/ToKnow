import type Database from 'better-sqlite3';
import type { DailyLog } from '../../shared/types';
import { mapDailyLog, type DailyLogRow } from '../db/rows';

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
