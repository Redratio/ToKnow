import Database from 'better-sqlite3';
import { migrate } from './migrate';

export function createDb(filePath: string): Database.Database {
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

let singleton: Database.Database | null = null;

export function setDb(db: Database.Database): void {
  singleton = db;
}

export function getDb(): Database.Database {
  if (!singleton) throw new Error('DB_NOT_OPEN');
  return singleton;
}

export function closeDb(): void {
  singleton?.close();
  singleton = null;
}
