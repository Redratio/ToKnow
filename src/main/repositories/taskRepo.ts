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

export function getTaskById(db: Database.Database, taskId: string): Task | null {
  const row = db
    .prepare('SELECT * FROM task WHERE id = ? AND deleted_at IS NULL')
    .get(taskId) as TaskRow | undefined;
  return row ? mapTask(row) : null;
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
