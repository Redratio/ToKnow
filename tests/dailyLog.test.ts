import { describe, expect, it } from 'vitest';
import { getDailyLog, upsertDailyLog } from '../src/main/repositories/dailyLogRepo';
import { insertTestProfile, makeTestDb } from './helpers/db';

const now = Date.parse('2026-10-18T22:00:00+08:00');

describe('upsertDailyLog', () => {
  it('inserts and updates one row per date', () => {
    const db = makeTestDb();
    insertTestProfile(db);

    const first = upsertDailyLog(
      db,
      'profile-test',
      { date: '2026-10-18', sleepHours: 7, energy: 4, mood: 3, focusSelf: 4, note: '还行' },
      now
    );
    const second = upsertDailyLog(
      db,
      'profile-test',
      { date: '2026-10-18', sleepHours: 6.5, energy: 3, mood: 4, focusSelf: 3, note: null },
      now + 1000
    );

    expect(second.id).toBe(first.id);
    expect(getDailyLog(db, 'profile-test', '2026-10-18')?.sleepHours).toBe(6.5);
    const count = db
      .prepare('SELECT COUNT(*) AS c FROM daily_log WHERE profile_id = ?')
      .get('profile-test') as { c: number };
    expect(count.c).toBe(1);
    db.close();
  });

  it('rejects out-of-range values', () => {
    const db = makeTestDb();
    insertTestProfile(db);
    expect(() =>
      upsertDailyLog(
        db,
        'profile-test',
        { date: '2026-10-18', sleepHours: 30, energy: 0, mood: 9, focusSelf: null },
        now
      )
    ).toThrow('INVALID_DAILY_LOG');
    db.close();
  });
});
