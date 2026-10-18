import { describe, expect, it } from 'vitest';
import { createManualTask } from '../src/main/services/calendarService';
import { completeTask, generateDailyPlan } from '../src/main/services/planService';
import { getTodayView } from '../src/main/services/todayService';
import { getTree } from '../src/main/services/treeService';
import { insertTask } from '../src/main/repositories/taskRepo';
import { applyEvidence } from '../src/main/repositories/treeRepo';
import type { Task } from '../src/shared/types';
import { seedTargetTree } from '../src/main/seed/targetTree';
import {
  insertTestNode,
  insertTestProfile,
  makeTestDb
} from './helpers/db';

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

  it('promotes the earliest manual task to mainline and fills the remaining capacity', () => {
    const db = seededDb();
    const later = createManualTask(
      db,
      'profile-test',
      { title: '后来的手动任务', date: today, plannedMin: 30 },
      now + 5_000
    );
    const earlier = createManualTask(
      db,
      'profile-test',
      { title: '最早的手动任务', date: today, plannedMin: 30 },
      now
    );

    const plan = generateDailyPlan(db, 'profile-test', today, now + 10_000);

    expect(plan.mainline).not.toBeNull();
    expect(plan.mainline!.id).toBe(earlier.id);
    expect(plan.mainline!.source).toBe('manual');
    expect(plan.mainline!.isMainline).toBe(true);
    expect(plan.supporting.map((t) => t.id)).toContain(later.id);
    // 自动规划只补最多 2 条，且总计划分钟不超过每日容量。
    expect(plan.supporting.filter((t) => t.source === 'plan')).toHaveLength(2);
    expect(plan.totalPlannedMin).toBeLessThanOrEqual(480);

    const stored = db
      .prepare('SELECT is_mainline FROM task WHERE id = ?')
      .get(earlier.id) as { is_mainline: number };
    expect(stored.is_mainline).toBe(1);

    const before = db
      .prepare('SELECT COUNT(*) AS c FROM task WHERE profile_id = ? AND scheduled_date = ?')
      .get('profile-test', today) as { c: number };
    const second = generateDailyPlan(db, 'profile-test', today, now + 20_000);
    const after = db
      .prepare('SELECT COUNT(*) AS c FROM task WHERE profile_id = ? AND scheduled_date = ?')
      .get('profile-test', today) as { c: number };
    expect(second.mainline?.id).toBe(earlier.id);
    expect(after.c).toBe(before.c);
    db.close();
  });

  it('computes auto-plan minutes against capacity left by manual tasks', () => {
    const db = seededDb();
    db.prepare('UPDATE study_profile SET daily_capacity_min = 100 WHERE id = ?').run(
      'profile-test'
    );
    createManualTask(
      db,
      'profile-test',
      { title: '占大部分容量', date: today, plannedMin: 70 },
      now
    );

    const plan = generateDailyPlan(db, 'profile-test', today, now + 1_000);

    // 剩余 30 分钟，两条自动任务各 15 分钟，合计正好 100。
    expect(plan.mainline).not.toBeNull();
    expect(plan.supporting.filter((t) => t.source === 'plan')).toHaveLength(2);
    for (const task of plan.supporting.filter((t) => t.source === 'plan')) {
      expect(task.plannedMin).toBe(15);
    }
    expect(plan.totalPlannedMin).toBeLessThanOrEqual(100);
    db.close();
  });

  it('rolls back mainline promotion when auto-plan insertion fails, then retries cleanly', () => {
    const db = seededDb();
    const manual = createManualTask(
      db,
      'profile-test',
      { title: '待晋升的手动任务', date: today, plannedMin: 60 },
      now
    );
    // 用真实 SQLite 失败注入：自动任务插入时中止，模拟 selectDailyPlan
    // 之后、insertPlanTasks 期间抛错。
    db.exec(
      `CREATE TRIGGER fail_plan_insert
       BEFORE INSERT ON task
       WHEN NEW.source = 'plan'
       BEGIN SELECT RAISE(ABORT, 'forced auto-plan failure'); END;`
    );

    expect(() =>
      generateDailyPlan(db, 'profile-test', today, now + 1_000)
    ).toThrow('forced auto-plan failure');

    const promoted = db
      .prepare('SELECT is_mainline FROM task WHERE id = ?')
      .get(manual.id) as { is_mainline: number };
    expect(promoted.is_mainline).toBe(0);
    const planTasks = db
      .prepare(
        `SELECT COUNT(*) AS c FROM task
         WHERE profile_id = ? AND scheduled_date = ? AND source = 'plan'`
      )
      .get('profile-test', today) as { c: number };
    expect(planTasks.c).toBe(0);

    db.exec('DROP TRIGGER fail_plan_insert');
    const retried = generateDailyPlan(db, 'profile-test', today, now + 2_000);
    expect(retried.mainline?.id).toBe(manual.id);
    expect(retried.mainline?.isMainline).toBe(true);
    db.close();
  });

  it('returns the manual mainline with no supporting tasks when capacity is too small', () => {
    const db = seededDb();
    db.prepare('UPDATE study_profile SET daily_capacity_min = 100 WHERE id = ?').run(
      'profile-test'
    );
    const manual = createManualTask(
      db,
      'profile-test',
      { title: '几乎占满容量', date: today, plannedMin: 95 },
      now
    );

    const plan = generateDailyPlan(db, 'profile-test', today, now + 1_000);

    expect(plan.mainline?.id).toBe(manual.id);
    expect(plan.supporting).toHaveLength(0);
    expect(plan.totalPlannedMin).toBe(95);
    db.close();
  });

  it('does not hide a task when the stored day already has two mainlines', () => {
    const db = seededDb();
    const base: Task = {
      id: '',
      profileId: 'profile-test',
      title: '存量主线',
      type: 'study',
      plannedMin: 30,
      actualMin: null,
      scheduledDate: today,
      status: 'todo',
      priorityScore: 0,
      isMainline: true,
      source: 'manual',
      locked: false,
      notes: null,
      createdAt: now,
      updatedAt: now
    };
    insertTask(db, { ...base, id: 'main-1' });
    insertTask(db, { ...base, id: 'main-2', createdAt: now + 1 });

    const plan = generateDailyPlan(db, 'profile-test', today, now + 1_000);

    expect(plan.mainline).not.toBeNull();
    expect(plan.supporting).toHaveLength(1);
    expect(
      [plan.mainline!.id, plan.supporting[0].id].sort()
    ).toEqual(['main-1', 'main-2']);
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

  it('writes no evidence for a manual task without a linked node', () => {
    const db = seededDb();
    const task = createManualTask(
      db,
      'profile-test',
      { title: '没有节点的手动任务', date: '2026-10-19', plannedMin: 30 },
      now
    );

    const result = completeTask(
      db,
      'profile-test',
      { taskId: task.id, actualMin: 30, performance: 4 },
      now + 1_000
    );

    expect(result.task.status).toBe('done');
    expect(result.mastery).toEqual({});
    const count = db
      .prepare('SELECT COUNT(*) AS c FROM evidence WHERE task_id = ?')
      .get(task.id) as { c: number };
    expect(count.c).toBe(0);
    db.close();
  });

  it('writes evidence for a manual task linked to a knowledge node', () => {
    const db = seededDb();
    const task = createManualTask(
      db,
      'profile-test',
      {
        title: '关联节点的手动任务',
        date: '2026-10-19',
        plannedMin: 30,
        nodeId: 'node_0_0_0'
      },
      now
    );

    const result = completeTask(
      db,
      'profile-test',
      { taskId: task.id, actualMin: 30, performance: 4 },
      now + 1_000
    );

    expect(result.mastery['node_0_0_0']).toBeGreaterThan(0);
    const evidence = db
      .prepare('SELECT kind FROM evidence WHERE task_id = ?')
      .all(task.id) as { kind: string }[];
    expect(evidence).toHaveLength(1);
    expect(evidence[0].kind).toBe('task_completion');
    db.close();
  });

  it('rejects completing a task owned by another profile', () => {
    const db = seededDb();
    insertTestProfile(db, 'profile-other');
    insertTask(db, {
      id: 'other-task',
      profileId: 'profile-other',
      title: '别人的任务',
      type: 'study',
      plannedMin: 30,
      actualMin: null,
      scheduledDate: today,
      status: 'todo',
      priorityScore: 0,
      isMainline: false,
      source: 'manual',
      locked: false,
      notes: null,
      createdAt: now,
      updatedAt: now
    });

    expect(() =>
      completeTask(
        db,
        'profile-test',
        { taskId: 'other-task', actualMin: 30, performance: 3 },
        now + 1_000
      )
    ).toThrow('TASK_NOT_FOUND');

    const stored = db
      .prepare('SELECT status FROM task WHERE id = ?')
      .get('other-task') as { status: string };
    expect(stored.status).toBe('todo');
    db.close();
  });

  it('rejects evidence for a node owned by another profile', () => {
    const db = seededDb();
    insertTestProfile(db, 'profile-other');
    const foreignNode = insertTestNode(db, 'profile-other', 'evidence');

    expect(() =>
      applyEvidence(
        db,
        'profile-test',
        foreignNode,
        null,
        'task_completion',
        4,
        now
      )
    ).toThrow('NODE_NOT_FOUND');
    const count = db
      .prepare('SELECT COUNT(*) AS c FROM evidence WHERE node_id = ?')
      .get(foreignNode) as { c: number };
    expect(count.c).toBe(0);
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
