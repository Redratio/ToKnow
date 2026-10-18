import type Database from 'better-sqlite3';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { BackupResult } from '../../shared/types';
import {
  mapDailyLog,
  mapNode,
  mapState,
  mapTask,
  type DailyLogRow,
  type NodeRow,
  type StateRow,
  type TaskRow
} from '../db/rows';
import { getActiveProfile } from '../repositories/profileRepo';
import { listSubjects } from '../repositories/treeRepo';

function stamp(now: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    '-',
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds())
  ].join('');
}

export async function exportBackup(
  db: Database.Database,
  destDir: string,
  now = new Date()
): Promise<BackupResult> {
  mkdirSync(destDir, { recursive: true });
  const base = `toknow-backup-${stamp(now)}`;
  const dbPath = path.join(destDir, `${base}.db`);
  const jsonPath = path.join(destDir, `${base}.json`);

  await db.backup(dbPath);

  const profile = getActiveProfile(db);

  const payload = {
    exportedAt: now.toISOString(),
    profile,
    subjects: profile ? listSubjects(db, profile.id) : [],
    // 以下各表都只导出当前 profile 的数据；.db 副本仍是完整数据库。
    nodes: (
      profile
        ? (db
            .prepare(
              `SELECT n.* FROM knowledge_node n
               JOIN module m ON m.id = n.module_id
               JOIN subject s ON s.id = m.subject_id
               WHERE s.profile_id = ? AND n.deleted_at IS NULL
                 AND m.deleted_at IS NULL AND s.deleted_at IS NULL`
            )
            .all(profile.id) as NodeRow[])
        : []
    ).map(mapNode),
    states: (
      profile
        ? (db
            .prepare('SELECT * FROM user_node_state WHERE profile_id = ?')
            .all(profile.id) as StateRow[])
        : []
    ).map(mapState),
    tasks: (
      profile
        ? (db
            .prepare(
              'SELECT * FROM task WHERE profile_id = ? AND deleted_at IS NULL'
            )
            .all(profile.id) as TaskRow[])
        : []
    )
      // 任务备注与日记原文同属反思层原文：JSON 默认导出置空，
      // `.db` 副本保留原文。
      .map((row) => ({ ...mapTask(row), notes: null })),
    // 反思层原文不进入默认导出：保留数值字段，note 置空。
    dailyLogs: (
      profile
        ? (db
            .prepare(
              `SELECT * FROM daily_log
               WHERE profile_id = ? AND deleted_at IS NULL
               ORDER BY date`
            )
            .all(profile.id) as DailyLogRow[])
        : []
    ).map((row) => ({ ...mapDailyLog(row), note: null }))
  };

  writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
  return { dbPath, jsonPath };
}
