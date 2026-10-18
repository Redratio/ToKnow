import type Database from 'better-sqlite3';
import { daysBetween } from '../../shared/date';
import type { TodayView } from '../../shared/types';
import { getActiveProfile } from '../repositories/profileRepo';
import { getDailyLog } from '../repositories/dailyLogRepo';
import { listTasksForDate } from '../repositories/taskRepo';
import { generateDailyPlan } from './planService';

export function getTodayView(
  db: Database.Database,
  profileId: string,
  date: string,
  nowMs: number
): TodayView {
  const profile = getActiveProfile(db);
  if (!profile) throw new Error('NO_PROFILE');

  const plan = generateDailyPlan(db, profileId, date, nowMs);
  const tasks = listTasksForDate(db, profileId, date);

  return {
    date,
    daysLeft: daysBetween(date, profile.examDate),
    plan,
    dailyLog: getDailyLog(db, profileId, date),
    completedCount: tasks.filter((t) => t.status === 'done').length,
    totalCount: tasks.length
  };
}
