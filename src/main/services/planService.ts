import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { selectDailyPlan } from '../../shared/planner';
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
  markTaskDone
} from '../repositories/taskRepo';
import { applyEvidence, listPlannerNodes } from '../repositories/treeRepo';

function buildPlan(tasks: Task[], date: string): DailyPlan {
  const mainline = tasks.find((t) => t.isMainline) ?? null;
  const supporting = tasks.filter((t) => !t.isMainline);
  return {
    date,
    mainline,
    supporting,
    totalPlannedMin: tasks.reduce((sum, t) => sum + t.plannedMin, 0)
  };
}

export function generateDailyPlan(
  db: Database.Database,
  profileId: string,
  date: string,
  nowMs: number
): DailyPlan {
  const existing = listTasksForDate(db, profileId, date);
  if (existing.length > 0) return buildPlan(existing, date);

  const profile = getActiveProfile(db);
  if (!profile) throw new Error('NO_PROFILE');

  const selection = selectDailyPlan({
    today: date,
    examDate: profile.examDate,
    dailyCapacityMin: profile.dailyCapacityMin,
    nowMs,
    nodes: listPlannerNodes(db, profileId)
  });

  if (!selection) return { date, mainline: null, supporting: [], totalPlannedMin: 0 };

  const ranked = [selection.mainline, ...selection.supporting];
  const tx = db.transaction(() => {
    ranked.forEach((node, index) => {
      const task: Task = {
        id: randomUUID(),
        profileId,
        title: `${index === 0 ? '主线' : '配套'} · ${node.title}`,
        type: index === 0 ? 'study' : 'review',
        plannedMin: selection.plannedMin,
        actualMin: null,
        scheduledDate: date,
        status: 'todo',
        priorityScore: node.score,
        isMainline: index === 0,
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

  return buildPlan(listTasksForDate(db, profileId, date), date);
}

export function completeTask(
  db: Database.Database,
  profileId: string,
  input: CompleteTaskInput,
  nowMs: number
): CompleteTaskResult {
  const task = getTaskById(db, input.taskId);
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

  const updated = getTaskById(db, task.id) ?? task;
  return { task: updated, mastery };
}
