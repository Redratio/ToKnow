import type Database from 'better-sqlite3';
import type { Task } from '../../shared/types';
import { mapTask, type TaskRow } from '../db/rows';

export function insertTask(db: Database.Database, task: Task): void {
  db.prepare(
    `INSERT INTO task
      (id, profile_id, title, type, planned_min, actual_min, scheduled_date,
       status, priority_score, is_mainline, source, locked, notes,
       created_at, updated_at, deleted_at, device_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  ).run(
    task.id,
    task.profileId,
    task.title,
    task.type,
    task.plannedMin,
    task.actualMin,
    task.scheduledDate,
    task.status,
    task.priorityScore,
    task.isMainline ? 1 : 0,
    task.source,
    task.locked ? 1 : 0,
    task.notes,
    task.createdAt,
    task.updatedAt,
    'local'
  );
}

export function linkTaskNode(
  db: Database.Database,
  taskId: string,
  nodeId: string,
  weight = 1
): void {
  // 任务与节点必须属于同一个 profile：沿 node → module → subject 校验，
  // 防止跨 profile 的节点被挂到本 profile 的任务上。
  const owned = db
    .prepare(
      `SELECT 1
       FROM task t
       JOIN knowledge_node n ON n.id = ?
       JOIN module m ON m.id = n.module_id
       JOIN subject s ON s.id = m.subject_id
       WHERE t.id = ? AND t.profile_id = s.profile_id
         AND n.deleted_at IS NULL AND m.deleted_at IS NULL AND s.deleted_at IS NULL`
    )
    .get(nodeId, taskId);
  if (!owned) throw new Error('NODE_NOT_FOUND');
  db.prepare(
    `INSERT OR REPLACE INTO task_node (task_id, node_id, weight) VALUES (?, ?, ?)`
  ).run(taskId, nodeId, weight);
}

export function listTasksForDate(
  db: Database.Database,
  profileId: string,
  date: string
): Task[] {
  const rows = db
    .prepare(
      `SELECT * FROM task
       WHERE profile_id = ? AND scheduled_date = ? AND deleted_at IS NULL
       ORDER BY is_mainline DESC, priority_score DESC`
    )
    .all(profileId, date) as TaskRow[];
  return rows.map(mapTask);
}

export function getTaskById(
  db: Database.Database,
  taskId: string,
  profileId?: string
): Task | null {
  const row = (
    profileId
      ? db
          .prepare(
            'SELECT * FROM task WHERE id = ? AND profile_id = ? AND deleted_at IS NULL'
          )
          .get(taskId, profileId)
      : db
          .prepare('SELECT * FROM task WHERE id = ? AND deleted_at IS NULL')
          .get(taskId)
  ) as TaskRow | undefined;
  return row ? mapTask(row) : null;
}

export function markTaskMainline(
  db: Database.Database,
  taskId: string,
  nowMs: number
): void {
  db.prepare(
    `UPDATE task SET is_mainline = 1, updated_at = ?
     WHERE id = ? AND deleted_at IS NULL`
  ).run(nowMs, taskId);
}

export function markTaskDone(
  db: Database.Database,
  taskId: string,
  actualMin: number,
  nowMs: number
): void {
  db.prepare(
    `UPDATE task SET status = 'done', actual_min = ?, updated_at = ? WHERE id = ?`
  ).run(actualMin, nowMs, taskId);
}

export function listNodeIdsForTask(
  db: Database.Database,
  taskId: string
): string[] {
  const rows = db
    .prepare('SELECT node_id FROM task_node WHERE task_id = ?')
    .all(taskId) as { node_id: string }[];
  return rows.map((r) => r.node_id);
}

export function listTasksForMonth(
  db: Database.Database,
  profileId: string,
  startDate: string,
  endDate: string
): Task[] {
  const rows = db
    .prepare(
      `SELECT * FROM task
       WHERE profile_id = ? AND scheduled_date BETWEEN ? AND ? AND deleted_at IS NULL
       ORDER BY scheduled_date, is_mainline DESC, priority_score DESC`
    )
    .all(profileId, startDate, endDate) as TaskRow[];
  return rows.map(mapTask);
}

export function updateTaskDate(
  db: Database.Database,
  taskId: string,
  date: string,
  nowMs: number
): void {
  db.prepare(
    `UPDATE task SET scheduled_date = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL`
  ).run(date, nowMs, taskId);
}
