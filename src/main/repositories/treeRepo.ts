import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import {
  EVIDENCE_ALPHA,
  updateMastery,
  type EvidenceKind
} from '../../shared/mastery';
import type { PlannerNode } from '../../shared/planner';
import type { Module, Subject } from '../../shared/types';
import {
  mapModule,
  mapSubject,
  type ModuleRow,
  type NodeRow,
  type StateRow,
  type SubjectRow
} from '../db/rows';

export function listPlannerNodes(
  db: Database.Database,
  profileId: string
): PlannerNode[] {
  const rows = db
    .prepare(
      `SELECT n.id AS node_id, n.module_id, m.subject_id, n.title,
              n.exam_weight, n.target_mastery,
              COALESCE(uns.mastery, 0) AS mastery,
              uns.last_studied_at
       FROM knowledge_node n
       JOIN module m ON m.id = n.module_id
       JOIN subject s ON s.id = m.subject_id
       LEFT JOIN user_node_state uns
         ON uns.node_id = n.id AND uns.profile_id = s.profile_id
       WHERE s.profile_id = ? AND n.deleted_at IS NULL
         AND m.deleted_at IS NULL AND s.deleted_at IS NULL`
    )
    .all(profileId) as {
    node_id: string;
    module_id: string;
    subject_id: string;
    title: string;
    exam_weight: number;
    target_mastery: number;
    mastery: number;
    last_studied_at: number | null;
  }[];

  return rows.map((row) => ({
    nodeId: row.node_id,
    moduleId: row.module_id,
    subjectId: row.subject_id,
    title: row.title,
    examWeight: row.exam_weight,
    mastery: row.mastery,
    targetMastery: row.target_mastery,
    lastStudiedAt: row.last_studied_at
  }));
}

/**
 * 节点是否属于该 profile：knowledge_node → module → subject → profile_id。
 * 用于拒绝把别的 profile 的节点挂到任务上或写入证据。
 */
export function nodeBelongsToProfile(
  db: Database.Database,
  nodeId: string,
  profileId: string
): boolean {
  const row = db
    .prepare(
      `SELECT 1
       FROM knowledge_node n
       JOIN module m ON m.id = n.module_id
       JOIN subject s ON s.id = m.subject_id
       WHERE n.id = ? AND s.profile_id = ?
         AND n.deleted_at IS NULL AND m.deleted_at IS NULL AND s.deleted_at IS NULL`
    )
    .get(nodeId, profileId);
  return row !== undefined;
}

/**
 * 写入一次学习证据并更新节点掌握度。
 * 调用方传入界面/自评的 0–5 分制 `performance`；内部除以 5 归一化为 0–1。
 * `evidence.performance` 与 `evidence.expected` 都存 0–1，二者可直接比较；
 * `updateMastery` 同样接收 0–1 表现分。
 * 掌握度不被夹到 `targetMastery`：目标只是达标阈值，允许超额掌握。
 */
export function applyEvidence(
  db: Database.Database,
  profileId: string,
  nodeId: string,
  taskId: string | null,
  kind: EvidenceKind,
  performance: number,
  nowMs: number
): number {
  if (!nodeBelongsToProfile(db, nodeId, profileId)) {
    throw new Error('NODE_NOT_FOUND');
  }
  const state = db
    .prepare(
      'SELECT mastery, confidence FROM user_node_state WHERE profile_id = ? AND node_id = ?'
    )
    .get(profileId, nodeId) as { mastery: number; confidence: number } | undefined;

  const current = state?.mastery ?? 0;
  const normalized = performance / 5;
  const expected = current / 5;
  const weight = EVIDENCE_ALPHA[kind];
  const next = updateMastery(current, normalized, weight);
  const confidence = Math.min(1, (state?.confidence ?? 0) + 0.05);

  if (state) {
    db.prepare(
      `UPDATE user_node_state
       SET mastery = ?, confidence = ?, last_studied_at = ?,
           review_count = review_count + 1, updated_by = 'evidence', updated_at = ?
       WHERE profile_id = ? AND node_id = ?`
    ).run(next, confidence, nowMs, nowMs, profileId, nodeId);
  } else {
    db.prepare(
      `INSERT INTO user_node_state
        (profile_id, node_id, self_rating, mastery, confidence,
         last_studied_at, next_review_at, review_count, updated_by, updated_at)
       VALUES (?, ?, 0, ?, ?, ?, NULL, 1, 'evidence', ?)`
    ).run(profileId, nodeId, next, confidence, nowMs, nowMs);
  }

  // performance / expected 统一为 0–1（调用方传入的 0–5 已归一化）；
  // weight 为 EVIDENCE_ALPHA 中该证据类型的 alpha。
  db.prepare(
    `INSERT INTO evidence
      (id, node_id, task_id, kind, performance, expected, weight, meta_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  ).run(randomUUID(), nodeId, taskId, kind, normalized, expected, weight, nowMs);

  return next;
}

export function listSubjects(db: Database.Database, profileId: string): Subject[] {
  const rows = db
    .prepare(
      `SELECT * FROM subject
       WHERE profile_id = ? AND deleted_at IS NULL
       ORDER BY order_index`
    )
    .all(profileId) as SubjectRow[];
  return rows.map(mapSubject);
}

export function listModules(
  db: Database.Database,
  profileId: string
): Module[] {
  const rows = db
    .prepare(
      `SELECT m.* FROM module m
       JOIN subject s ON s.id = m.subject_id
       WHERE s.profile_id = ? AND m.deleted_at IS NULL AND s.deleted_at IS NULL
       ORDER BY m.order_index`
    )
    .all(profileId) as ModuleRow[];
  return rows.map(mapModule);
}

export function listNodes(db: Database.Database, profileId: string): NodeRow[] {
  return db
    .prepare(
      `SELECT n.* FROM knowledge_node n
       JOIN module m ON m.id = n.module_id
       JOIN subject s ON s.id = m.subject_id
       WHERE s.profile_id = ? AND n.deleted_at IS NULL
         AND m.deleted_at IS NULL AND s.deleted_at IS NULL
       ORDER BY n.order_index`
    )
    .all(profileId) as NodeRow[];
}

export function listStates(db: Database.Database, profileId: string): StateRow[] {
  return db
    .prepare('SELECT * FROM user_node_state WHERE profile_id = ?')
    .all(profileId) as StateRow[];
}
