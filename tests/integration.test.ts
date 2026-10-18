import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createDb } from '../src/main/db/connection';
import { createHandlers } from '../src/main/ipc';

describe('P0 end-to-end', () => {
  it('completes the daily loop and exports a backup', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'toknow-e2e-'));
    const db = createDb(path.join(dir, 'toknow.db'));
    const handlers = createHandlers({
      db,
      dbPath: path.join(dir, 'toknow.db'),
      backupDir: path.join(dir, 'backups'),
      version: '0.1.0'
    });

    expect(handlers.bootstrap().profile).toBeNull();

    const profile = handlers.submitOnboarding({
      name: '端到端',
      examDate: '2099-12-19',
      dailyCapacityMin: 480,
      selfRatings: { math: 1, english: 2, politics: 0, '825': 1 }
    });
    expect(handlers.bootstrap().profile?.id).toBe(profile.id);

    const view = handlers.getToday();
    expect(view.plan.mainline).not.toBeNull();
    expect(view.plan.supporting).toHaveLength(2);

    const masteryBefore = new Map(
      handlers
        .getTree()
        .flatMap((s) => s.modules)
        .flatMap((m) => m.nodes)
        .map((n) => [n.id, n.state.mastery] as const)
    );
    const completed = handlers.completeTask({
      taskId: view.plan.mainline!.id,
      actualMin: 50,
      performance: 4
    });
    const touchedMastery = Object.entries(completed.mastery);
    expect(touchedMastery.length).toBeGreaterThan(0);
    for (const [nodeId, mastery] of touchedMastery) {
      expect(mastery).toBeGreaterThan(masteryBefore.get(nodeId) ?? 0);
    }
    handlers.checkIn({
      date: view.date,
      sleepHours: 7.5,
      energy: 4,
      mood: 4,
      focusSelf: 4,
      note: '完成主线'
    });

    const after = handlers.getToday();
    expect(after.completedCount).toBe(1);
    expect(after.dailyLog?.sleepHours).toBe(7.5);

    const tree = handlers.getTree();
    expect(tree).toHaveLength(4);
    const [touchedNodeId, touchedMasteryAfter] = touchedMastery[0];
    const touched = tree
      .flatMap((s) => s.modules)
      .flatMap((m) => m.nodes)
      .find((n) => n.id === touchedNodeId);
    expect(touched).toBeDefined();
    expect(touched!.state.mastery).toBe(touchedMasteryAfter);

    const manual = handlers.createTask({
      title: '手动作业',
      date: '2099-12-20',
      plannedMin: 30
    });
    expect(handlers.getCalendarDay('2099-12-20').tasks).toHaveLength(1);

    const moved = handlers.moveTask({
      taskId: manual.id,
      date: '2099-12-21'
    });
    expect(moved.scheduledDate).toBe('2099-12-21');

    const december = handlers.getCalendarMonth(2099, 12);
    expect(december.days).toHaveLength(31);
    expect(december.days.find((d) => d.date === '2099-12-20')?.taskCount).toBe(0);
    expect(december.days.find((d) => d.date === '2099-12-21')?.taskCount).toBe(1);

    const backup = await handlers.exportBackup();
    expect(existsSync(backup.dbPath)).toBe(true);
    expect(existsSync(backup.jsonPath)).toBe(true);
    const json = JSON.parse(readFileSync(backup.jsonPath, 'utf8')) as {
      dailyLogs: { note: string | null }[];
    };
    expect(json.dailyLogs).toHaveLength(1);
    expect(json.dailyLogs[0].note).toBeNull();

    db.close();
  });
});
