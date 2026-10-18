import type Database from 'better-sqlite3';

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS study_profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  exam_date TEXT NOT NULL,
  daily_capacity_min INTEGER NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  device_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subject (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES study_profile(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  exam_weight REAL NOT NULL,
  color TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  device_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS module (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subject(id),
  name TEXT NOT NULL,
  exam_weight REAL NOT NULL,
  order_index INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  device_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_node (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES module(id),
  parent_id TEXT REFERENCES knowledge_node(id),
  title TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('chapter','section','point')),
  exam_weight REAL NOT NULL DEFAULT 1,
  difficulty INTEGER NOT NULL DEFAULT 3,
  target_mastery REAL NOT NULL DEFAULT 4,
  order_index INTEGER NOT NULL,
  syllabus_version TEXT NOT NULL DEFAULT '2026',
  description TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  device_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS node_prerequisite (
  node_id TEXT NOT NULL REFERENCES knowledge_node(id),
  prerequisite_node_id TEXT NOT NULL REFERENCES knowledge_node(id),
  strength TEXT NOT NULL CHECK(strength IN ('required','recommended')),
  PRIMARY KEY (node_id, prerequisite_node_id)
);

CREATE TABLE IF NOT EXISTS user_node_state (
  profile_id TEXT NOT NULL REFERENCES study_profile(id),
  node_id TEXT NOT NULL REFERENCES knowledge_node(id),
  self_rating REAL NOT NULL DEFAULT 0,
  mastery REAL NOT NULL DEFAULT 0,
  confidence REAL NOT NULL DEFAULT 0,
  last_studied_at INTEGER,
  next_review_at INTEGER,
  review_count INTEGER NOT NULL DEFAULT 0,
  updated_by TEXT NOT NULL DEFAULT 'self',
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (profile_id, node_id)
);

CREATE TABLE IF NOT EXISTS task (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES study_profile(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  planned_min INTEGER NOT NULL,
  actual_min INTEGER,
  scheduled_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  priority_score REAL NOT NULL DEFAULT 0,
  is_mainline INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'plan',
  locked INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  device_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS task_node (
  task_id TEXT NOT NULL REFERENCES task(id),
  node_id TEXT NOT NULL REFERENCES knowledge_node(id),
  weight REAL NOT NULL DEFAULT 1,
  PRIMARY KEY (task_id, node_id)
);

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  node_id TEXT NOT NULL REFERENCES knowledge_node(id),
  task_id TEXT REFERENCES task(id),
  kind TEXT NOT NULL,
  performance REAL NOT NULL,
  expected REAL NOT NULL,
  weight REAL NOT NULL,
  meta_json TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_log (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES study_profile(id),
  date TEXT NOT NULL,
  sleep_hours REAL,
  energy INTEGER,
  mood INTEGER,
  focus_self INTEGER,
  note TEXT,
  checkin_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  deleted_at INTEGER,
  device_id TEXT NOT NULL,
  UNIQUE(profile_id, date)
);

CREATE TABLE IF NOT EXISTS setting (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_outbox (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  op TEXT NOT NULL,
  payload_json TEXT,
  created_at INTEGER NOT NULL,
  synced_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_node_module ON knowledge_node(module_id);
CREATE INDEX IF NOT EXISTS idx_node_parent ON knowledge_node(parent_id);
CREATE INDEX IF NOT EXISTS idx_task_date ON task(profile_id, scheduled_date, status);
CREATE INDEX IF NOT EXISTS idx_evidence_node ON evidence(node_id, created_at);
CREATE INDEX IF NOT EXISTS idx_daily_date ON daily_log(profile_id, date);
`;

const MIGRATIONS: { version: number; sql: string }[] = [{ version: 1, sql: INIT_SQL }];

export function migrate(db: Database.Database): void {
  const current = db.pragma('user_version', { simple: true }) as number;
  for (const migration of MIGRATIONS) {
    if (migration.version <= current) continue;
    db.exec('BEGIN');
    try {
      db.exec(migration.sql);
      db.pragma(`user_version = ${migration.version}`);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }
}
