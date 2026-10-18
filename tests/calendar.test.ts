import { describe, expect, it } from 'vitest';
import { upsertDailyLog } from '../src/main/repositories/dailyLogRepo';
import {
  createManualTask,
  getDayView,
  getMonthView,
  rescheduleTask
} from '../src/main/services/calendarService';
import { generateDailyPlan } from '../src/main/services/planService';
import { seedTargetTree } from '../src/main/seed/targetTree';
import { insertTestProfile, makeTestDb } from './helpers/db';

const now = Date.parse('2026-10-18T12:00:00+08:00');

function seededDb() {
  const db = makeTestDb();
  insertTestProfile(db);
  seedTargetTree(db, 'profile-test');
  return db;
}

describe('getMonthView', () => {
  it('returns every day of the month with task counts and check-in dots', () => {
    const db = seededDb();
    generateDailyPlan(db, 'profile-test', '2026-10-18', now);
    upsertDailyLog(
      db,
      'profile-test',
      { date: '2026-10-18', sleepHours: 7, energy: 3, mood: 3, focusSelf: 3 },
      now
    );

    const month = getMonthView(db, 'profile-test', 2026, 10);
    expect(month.days).toHaveLength(31);
    expect(month.days[0].date).toBe('2026-10-01');
    expect(month.tasks).toHaveLength(3);

    const day = month.days.find((d) => d.date === '2026-10-18')!;
    expect(day.taskCount).toBe(3);
    expect(day.doneCount).toBe(0);
    expect(day.plannedMin).toBe(180);
    expect(day.hasCheckIn).toBe(true);

    expect(month.days.find((d) => d.date === '2026-10-19')?.taskCount).toBe(0);
    db.close();
  });
});

describe('manual tasks', () => {
  it('creates a task on a day and moves it to another day', () => {
    const db = seededDb();

    const task = createManualTask(
      db,
      'profile-test',
      { title: '电路第三章错题 1–10', date: '2026-10-20', plannedMin: 45 },
      now
    );
    expect(task.source).toBe('manual');
    expect(task.isMainline).toBe(false);
    expect(task.status).toBe('todo');
    expect(getDayView(db, 'profile-test', '2026-10-20').tasks.map((t) => t.id)).toContain(
      task.id
    );

    const moved = rescheduleTask(
      db,
      'profile-test',
      { taskId: task.id, date: '2026-10-22' },
      now
    );
    expect(moved.scheduledDate).toBe('2026-10-22');

    const month = getMonthView(db, 'profile-test', 2026, 10);
    expect(month.days.find((d) => d.date === '2026-10-20')?.taskCount).toBe(0);
    expect(month.days.find((d) => d.date === '2026-10-22')?.taskCount).toBe(1);
    db.close();
  });

  it('rejects invalid titles, minutes, dates and missing tasks', () => {
    const db = seededDb();
    expect(() =>
      createManualTask(
        db,
        'profile-test',
        { title: '   ', date: '2026-10-20', plannedMin: 45 },
        now
      )
    ).toThrow('INVALID_TASK_TITLE');
    expect(() =>
      createManualTask(
        db,
        'profile-test',
        { title: '任务', date: '2026-10-20', plannedMin: 4 },
        now
      )
    ).toThrow('INVALID_TASK_MINUTES');
    expect(() =>
      createManualTask(
        db,
        'profile-test',
        { title: '任务', date: '2026-13-01', plannedMin: 30 },
        now
      )
    ).toThrow('INVALID_DATE');
    expect(() =>
      rescheduleTask(
        db,
        'profile-test',
        { taskId: 'missing', date: '2026-10-21' },
        now
      )
    ).toThrow('TASK_NOT_FOUND');
    db.close();
  });
});

describe('getDayView', () => {
  it('returns the day tasks and the check-in summary', () => {
    const db = seededDb();
    upsertDailyLog(
      db,
      'profile-test',
      { date: '2026-10-20', sleepHours: 6.5, energy: 2, mood: 3, focusSelf: 2 },
      now
    );
    const view = getDayView(db, 'profile-test', '2026-10-20');
    expect(view.tasks).toHaveLength(0);
    expect(view.dailyLog?.sleepHours).toBe(6.5);
    db.close();
  });
});
