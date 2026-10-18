import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import type {
  CalendarDay,
  CalendarDayView,
  CalendarMonthView,
  CreateTaskInput,
  MoveTaskInput,
  Task
} from '../../shared/types';
import {
  getDailyLog,
  listDailyLogsBetween
} from '../repositories/dailyLogRepo';
import {
  getTaskById,
  insertTask,
  linkTaskNode,
  listTasksForDate,
  listTasksForMonth,
  updateTaskDate
} from '../repositories/taskRepo';
import { nodeBelongsToProfile } from '../repositories/treeRepo';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function assertDate(date: string): void {
  if (!DATE_RE.test(date)) throw new Error('INVALID_DATE');
  const parsed = new Date(`${date}T00:00:00`);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== Number(date.slice(0, 4)) ||
    parsed.getMonth() + 1 !== Number(date.slice(5, 7)) ||
    parsed.getDate() !== Number(date.slice(8, 10))
  ) {
    throw new Error('INVALID_DATE');
  }
}

export function monthBounds(
  year: number,
  month: number
): { start: string; end: string } {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error('INVALID_MONTH');
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('INVALID_MONTH');
  }
  const daysInMonth = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${pad(month)}-01`,
    end: `${year}-${pad(month)}-${pad(daysInMonth)}`
  };
}

export function getMonthView(
  db: Database.Database,
  profileId: string,
  year: number,
  month: number
): CalendarMonthView {
  const { start, end } = monthBounds(year, month);
  const tasks = listTasksForMonth(db, profileId, start, end);
  const logs = listDailyLogsBetween(db, profileId, start, end);
  const checkinDates = new Set(logs.map((log) => log.date));

  const byDate = new Map<string, Task[]>();
  for (const task of tasks) {
    const list = byDate.get(task.scheduledDate) ?? [];
    list.push(task);
    byDate.set(task.scheduledDate, list);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${year}-${pad(month)}-${pad(day)}`;
    const dayTasks = byDate.get(date) ?? [];
    days.push({
      date,
      taskCount: dayTasks.length,
      doneCount: dayTasks.filter((task) => task.status === 'done').length,
      plannedMin: dayTasks.reduce((sum, task) => sum + task.plannedMin, 0),
      hasCheckIn: checkinDates.has(date)
    });
  }

  return { year, month, days, tasks };
}

export function getDayView(
  db: Database.Database,
  profileId: string,
  date: string
): CalendarDayView {
  assertDate(date);
  return {
    date,
    tasks: listTasksForDate(db, profileId, date),
    dailyLog: getDailyLog(db, profileId, date)
  };
}

export function createManualTask(
  db: Database.Database,
  profileId: string,
  input: CreateTaskInput,
  nowMs: number
): Task {
  const title = input.title.trim();
  if (title.length < 1 || title.length > 120) {
    throw new Error('INVALID_TASK_TITLE');
  }
  assertDate(input.date);
  if (
    !Number.isInteger(input.plannedMin) ||
    input.plannedMin < 5 ||
    input.plannedMin > 600
  ) {
    throw new Error('INVALID_TASK_MINUTES');
  }
  if (input.nodeId && !nodeBelongsToProfile(db, input.nodeId, profileId)) {
    throw new Error('NODE_NOT_FOUND');
  }

  const task: Task = {
    id: randomUUID(),
    profileId,
    title,
    type: 'study',
    plannedMin: input.plannedMin,
    actualMin: null,
    scheduledDate: input.date,
    status: 'todo',
    priorityScore: 0,
    isMainline: false,
    source: 'manual',
    locked: false,
    notes: null,
    createdAt: nowMs,
    updatedAt: nowMs
  };

  const tx = db.transaction(() => {
    insertTask(db, task);
    if (input.nodeId) linkTaskNode(db, task.id, input.nodeId);
  });
  tx();
  return task;
}

export function rescheduleTask(
  db: Database.Database,
  profileId: string,
  input: MoveTaskInput,
  nowMs: number
): Task {
  assertDate(input.date);
  const task = getTaskById(db, input.taskId, profileId);
  if (!task) throw new Error('TASK_NOT_FOUND');
  if (task.isMainline) throw new Error('MAINLINE_LOCKED');
  updateTaskDate(db, task.id, input.date, nowMs);
  return getTaskById(db, task.id, profileId)!;
}
