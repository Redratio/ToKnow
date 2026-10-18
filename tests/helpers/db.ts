import type Database from 'better-sqlite3';
import { createDb } from '../../src/main/db/connection';

export function makeTestDb(): Database.Database {
  return createDb(':memory:');
}

export function insertTestProfile(db: Database.Database, id = 'profile-test'): void {
  const now = Date.now();
  db.prepare(
    `INSERT INTO study_profile
      (id, name, exam_date, daily_capacity_min, timezone, active,
       created_at, updated_at, deleted_at, device_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  ).run(id, '测试用户', '2026-12-19', 480, 'Asia/Shanghai', 1, now, now, 'test-device');
}

/** 为一个 profile 插入一套最小的 subject/module/node，返回 node id。 */
export function insertTestNode(
  db: Database.Database,
  profileId: string,
  suffix: string
): string {
  const now = Date.now();
  const subjectId = `subject-${suffix}`;
  const moduleId = `module-${suffix}`;
  const nodeId = `node-${suffix}`;
  db.prepare(
    `INSERT INTO subject
      (id, profile_id, name, code, exam_weight, color, order_index,
       created_at, updated_at, deleted_at, device_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  ).run(subjectId, profileId, `科目 ${suffix}`, suffix, 1, '#000000', 0, now, now, 'test-device');
  db.prepare(
    `INSERT INTO module
      (id, subject_id, name, exam_weight, order_index,
       created_at, updated_at, deleted_at, device_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)`
  ).run(moduleId, subjectId, `模块 ${suffix}`, 1, 0, now, now, 'test-device');
  db.prepare(
    `INSERT INTO knowledge_node
      (id, module_id, parent_id, title, kind, exam_weight, difficulty,
       target_mastery, order_index, syllabus_version, description,
       created_at, updated_at, deleted_at, device_id)
     VALUES (?, ?, NULL, ?, 'chapter', 1, 3, 4, 0, '2026', NULL, ?, ?, NULL, ?)`
  ).run(nodeId, moduleId, `节点 ${suffix}`, now, now, 'test-device');
  return nodeId;
}
