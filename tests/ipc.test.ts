import { describe, expect, it, vi } from 'vitest';
import { createHandlers, registerIpc } from '../src/main/ipc';
import { IPC } from '../src/shared/ipc';
import { makeTestDb } from './helpers/db';

describe('ipc handlers', () => {
  it('runs the onboarding → plan → complete → check-in flow', () => {
    const db = makeTestDb();
    const handlers = createHandlers({
      db,
      dbPath: ':memory:',
      backupDir: 'C:/tmp/toknow-test',
      version: '0.1.0'
    });

    expect(handlers.bootstrap().profile).toBeNull();

    const profile = handlers.submitOnboarding({
      name: '小明',
      examDate: '2099-12-19',
      dailyCapacityMin: 480,
      selfRatings: { math: 2, english: 3, politics: 0, '825': 1 }
    });
    expect(handlers.bootstrap().profile?.id).toBe(profile.id);

    const today = handlers.getToday();
    expect(today.plan.mainline).not.toBeNull();
    expect(today.totalCount).toBe(3);

    const result = handlers.completeTask({
      taskId: today.plan.mainline!.id,
      actualMin: 40,
      performance: 4
    });
    expect(result.task.status).toBe('done');

    const log = handlers.checkIn({
      date: today.date,
      sleepHours: 7,
      energy: 4,
      mood: 3,
      focusSelf: 4,
      note: '完成主线'
    });
    expect(log.note).toBe('完成主线');
    expect(handlers.getToday().dailyLog?.id).toBe(log.id);

    expect(handlers.getTree()).toHaveLength(4);
    expect(handlers.getSettings().dbPath).toBe(':memory:');
    db.close();
  });

  it('registers every IPC constant exactly once', () => {
    const registered: string[] = [];
    const handle = vi.fn((channel: string) => {
      registered.push(channel);
    });
    const ipcMain = { handle } as unknown as Parameters<typeof registerIpc>[0];
    const db = makeTestDb();

    registerIpc(
      ipcMain,
      createHandlers({
        db,
        dbPath: ':memory:',
        backupDir: 'C:/tmp/toknow-test',
        version: '0.1.0'
      })
    );

    expect(handle).toHaveBeenCalledTimes(Object.keys(IPC).length);
    expect(registered).toHaveLength(Object.keys(IPC).length);
    expect(new Set(registered)).toEqual(new Set(Object.values(IPC)));
    db.close();
  });
});
