import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { selectDailyPlan, type DailySelection } from '../../shared/planner';
import type {
  CompleteTaskInput,
  CompleteTaskResult,
  DailyPlan,
  Task
} from '../../shared/types';
import { getActiveProfile } from '../repositories/profileRepo';
import {
  getTaskById,
  insertTask,
  linkTaskNode,
  listNodeIdsForTask,
  listTasksForDate,
  markTaskDone,
  markTaskMainline
} from '../repositories/taskRepo';
import { applyEvidence, listPlannerNodes } from '../repositories/treeRepo';

// 自动规划单条任务的最低分钟数；剩余容量低于它就不再排辅助任务。
const MIN_PLAN_TASK_MIN = 10;
// 手动任务已占主线时，自动规划最多补 2 条辅助任务。
const MAX_AUTO_SUPPORTING = 2;

function buildPlan(tasks: Task[], date: string): DailyPlan {
  const mainline = tasks.find((t) => t.isMainline) ?? null;
  // 按 id 排除主线，而不是按 isMainline：存储层若异常出现两条主线，
  // 这里也不能让另一条从 supporting 中消失。
  const supporting = tasks.filter((t) => t.id !== mainline?.id);
  return {
    date,
    mainline,
    supporting,
    totalPlannedMin: tasks.reduce((sum, t) => sum + t.plannedMin, 0)
  };
}

function insertPlanTasks(
  db: Database.Database,
  profileId: string,
  date: string,
  nowMs: number,
  selection: DailySelection,
  asSupporting: boolean
): void {
  const ranked = [selection.mainline, ...selection.supporting];
  const tx = db.transaction(() => {
    ranked.forEach((node, index) => {
      const isMainline = !asSupporting && index === 0;
      const task: Task = {
        id: randomUUID(),
        profileId,
        title: `${isMainline ? '主线' : '配套'} · ${node.title}`,
        type: isMainline ? 'study' : 'review',
        plannedMin: selection.plannedMin,
        actualMin: null,
        scheduledDate: date,
        status: 'todo',
        priorityScore: node.score,
        isMainline,
        source: 'plan',
        locked: false,
        notes: null,
        createdAt: nowMs,
        updatedAt: nowMs
      };
      insertTask(db, task);
      linkTaskNode(db, task.id, node.nodeId);
    });
  });
  tx();
}

export function generateDailyPlan(
  db: Database.Database,
  profileId: string,
  date: string,
  nowMs: number
): DailyPlan {
  const existing = listTasksForDate(db, profileId, date);
  // 幂等只看“是否已有真正的主线”，而不是“这一天有没有任何任务”。
  if (existing.some((task) => task.isMainline)) {
    return buildPlan(existing, date);
  }

  const profile = getActiveProfile(db);
  if (!profile) throw new Error('NO_PROFILE');

  // 手动任务表达用户意图，优先级高于自动规划：最早创建的手动任务当主线。
  const manualTasks = existing
    .filter((task) => task.source === 'manual')
    .sort(
      (a, b) =>
        a.createdAt - b.createdAt || a.id.localeCompare(b.id)
    );

  if (manualTasks.length > 0) {
    const mainline = manualTasks[0];
    markTaskMainline(db, mainline.id, nowMs);

    // 手动任务先占容量，自动规划只能使用剩余额度。
    const manualTotal = manualTasks.reduce(
      (sum, task) => sum + task.plannedMin,
      0
    );
    const remaining = Math.max(0, profile.dailyCapacityMin - manualTotal);
    const maxAuto = Math.min(
      MAX_AUTO_SUPPORTING,
      Math.floor(remaining / MIN_PLAN_TASK_MIN)
    );

    if (maxAuto >= 1) {
      const selection = selectDailyPlan({
        today: date,
        examDate: profile.examDate,
        dailyCapacityMin: remaining,
        nowMs,
        nodes: listPlannerNodes(db, profileId),
        maxTasks: maxAuto
      });
      // 剩余容量装不下任何一条自动任务时，只返回手动主线，绝不返回空计划。
      if (selection) {
        insertPlanTasks(db, profileId, date, nowMs, selection, true);
      }
    }

    return buildPlan(listTasksForDate(db, profileId, date), date);
  }

  // 没有主线、也没有手动任务的异常存量数据：保留现状，不重复生成。
  if (existing.length > 0) return buildPlan(existing, date);

  const selection = selectDailyPlan({
    today: date,
    examDate: profile.examDate,
    dailyCapacityMin: profile.dailyCapacityMin,
    nowMs,
    nodes: listPlannerNodes(db, profileId)
  });

  if (!selection) return { date, mainline: null, supporting: [], totalPlannedMin: 0 };

  insertPlanTasks(db, profileId, date, nowMs, selection, false);
  return buildPlan(listTasksForDate(db, profileId, date), date);
}

export function completeTask(
  db: Database.Database,
  profileId: string,
  input: CompleteTaskInput,
  nowMs: number
): CompleteTaskResult {
  const task = getTaskById(db, input.taskId, profileId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  if (task.status === 'done') return { task, mastery: {} };

  const performance = Math.min(5, Math.max(0, input.performance));
  const actualMin = Math.max(0, Math.round(input.actualMin));
  const mastery: Record<string, number> = {};

  const tx = db.transaction(() => {
    markTaskDone(db, task.id, actualMin, nowMs);
    for (const nodeId of listNodeIdsForTask(db, task.id)) {
      mastery[nodeId] = applyEvidence(
        db,
        profileId,
        nodeId,
        task.id,
        'task_completion',
        performance,
        nowMs
      );
    }
  });
  tx();

  const updated = getTaskById(db, task.id, profileId) ?? task;
  return { task: updated, mastery };
}
