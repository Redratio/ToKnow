import { describe, expect, it } from 'vitest';
import { completeTask, generateDailyPlan } from '../src/main/services/planService';
import { getTodayView } from '../src/main/services/todayService';
import { getTree } from '../src/main/services/treeService';
import { seedTargetTree } from '../src/main/seed/targetTree';
import { insertTestProfile, makeTestDb } from './helpers/db';

const now = Date.parse('2026-10-18T12:00:00+08:00');
const today = '2026-10-18';

function seededDb() {
  const db = makeTestDb();
  insertTestProfile(db);
  seedTargetTree(db, 'profile-test');
  return db;
}

describe('generateDailyPlan', () => {
  it('creates one mainline and two supporting tasks', () => {
    const db = seededDb();
    const plan = generateDailyPlan(db, 'profile-test', today, now);
    expect(plan.mainline).not.toBeNull();
    expect(plan.mainline?.isMainline).toBe(true);
    expect(plan.supporting).toHaveLength(2);
    expect(plan.totalPlannedMin).toBe(180);
    db.close();
  });

  it('is idempotent for the same date', () => {
    const db = seededDb();
    const first = generateDailyPlan(db, 'profile-test', today, now);
    const second = generateDailyPlan(db, 'profile-test', today, now);
    expect(second.mainline?.id).toBe(first.mainline?.id);
    const count = db
      .prepare('SELECT COUNT(*) AS c FROM task WHERE profile_id = ? AND scheduled_date = ?')
      .get('profile-test', today) as { c: number };
    expect(count.c).toBe(3);
    db.close();
  });
});

describe('completeTask', () => {
  it('marks done, writes evidence and raises mastery', () => {
    const db = seededDb();
    const plan = generateDailyPlan(db, 'profile-test', today, now);
    const task = plan.mainline!;

    const result = completeTask(
      db,
      'profile-test',
      { taskId: task.id, actualMin: 45, performance: 4 },
      now
    );

    expect(result.task.status).toBe('done');
    expect(result.task.actualMin).toBe(45);
    expect(Object.keys(result.mastery)).toHaveLength(1);
    expect(Object.values(result.mastery)[0]).toBeGreaterThan(0);

    const evidence = db
      .prepare('SELECT kind, performance FROM evidence WHERE task_id = ?')
      .all(task.id) as { kind: string; performance: number }[];
    expect(evidence).toHaveLength(1);
    expect(evidence[0].kind).toBe('task_completion');
    expect(evidence[0].performance).toBeCloseTo(0.8);
    db.close();
  });

  it('does not duplicate evidence when completed twice', () => {
    const db = seededDb();
    const plan = generateDailyPlan(db, 'profile-test', today, now);
    const input = { taskId: plan.mainline!.id, actualMin: 30, performance: 3 };
    completeTask(db, 'profile-test', input, now);
    completeTask(db, 'profile-test', input, now);
    const count = db
      .prepare('SELECT COUNT(*) AS c FROM evidence WHERE task_id = ?')
      .get(input.taskId) as { c: number };
    expect(count.c).toBe(1);
    db.close();
  });
});

describe('getTodayView', () => {
  it('reports completion counts and days left', () => {
    const db = seededDb();
    const plan = generateDailyPlan(db, 'profile-test', today, now);
    completeTask(
      db,
      'profile-test',
      { taskId: plan.mainline!.id, actualMin: 30, performance: 3 },
      now
    );
    const view = getTodayView(db, 'profile-test', today, now);
    expect(view.daysLeft).toBe(62);
    expect(view.completedCount).toBe(1);
    expect(view.totalCount).toBe(3);
    expect(view.dailyLog).toBeNull();
    db.close();
  });
});

describe('getTree', () => {
  it('returns four subjects with nested modules and nodes', () => {
    const db = seededDb();
    const tree = getTree(db, 'profile-test');
    expect(tree).toHaveLength(4);
    expect(tree.find((s) => s.code === '825')?.modules).toHaveLength(3);
    const circuits = tree
      .find((s) => s.code === '825')
      ?.modules.find((m) => m.name.includes('电路'));
    expect(circuits?.nodes.length).toBe(7);
    expect(circuits?.nodes[0].state.mastery).toBe(0);
    db.close();
  });
});
