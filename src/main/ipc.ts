import type Database from 'better-sqlite3';
import type { IpcMain } from 'electron';
import { getStudyDate } from '../shared/date';
import { IPC, type AppSettings, type Bootstrap } from '../shared/ipc';
import type {
  BackupResult,
  CalendarDayView,
  CalendarMonthView,
  CompleteTaskInput,
  CompleteTaskResult,
  CreateTaskInput,
  DailyLog,
  DailyLogInput,
  MoveTaskInput,
  OnboardingInput,
  Profile,
  Task,
  TodayView,
  TreeSubject
} from '../shared/types';
import { getActiveProfile } from './repositories/profileRepo';
import { upsertDailyLog } from './repositories/dailyLogRepo';
import { exportBackup as exportBackupService } from './services/backupService';
import {
  createManualTask,
  getDayView as getCalendarDayView,
  getMonthView as getCalendarMonthView,
  rescheduleTask
} from './services/calendarService';
import { completeTask as completeTaskService } from './services/planService';
import { getTodayView } from './services/todayService';
import { submitOnboarding as submitOnboardingService } from './services/onboardingService';
import { getTree as getTreeService } from './services/treeService';

export interface HandlerContext {
  db: Database.Database;
  dbPath: string;
  backupDir: string;
  version: string;
}

export function createHandlers(ctx: HandlerContext) {
  const requireProfile = (): Profile => {
    const profile = getActiveProfile(ctx.db);
    if (!profile) throw new Error('NO_PROFILE');
    return profile;
  };

  return {
    bootstrap: (): Bootstrap => ({
      profile: getActiveProfile(ctx.db),
      today: getStudyDate(new Date())
    }),
    submitOnboarding: (input: OnboardingInput): Profile =>
      submitOnboardingService(ctx.db, input),
    getToday: (): TodayView =>
      getTodayView(ctx.db, requireProfile().id, getStudyDate(new Date()), Date.now()),
    completeTask: (input: CompleteTaskInput): CompleteTaskResult =>
      completeTaskService(ctx.db, requireProfile().id, input, Date.now()),
    checkIn: (input: DailyLogInput): DailyLog =>
      upsertDailyLog(ctx.db, requireProfile().id, input, Date.now()),
    getTree: (): TreeSubject[] => getTreeService(ctx.db, requireProfile().id),
    exportBackup: (): Promise<BackupResult> =>
      exportBackupService(ctx.db, ctx.backupDir),
    getSettings: (): AppSettings => ({
      dbPath: ctx.dbPath,
      backupDir: ctx.backupDir,
      version: ctx.version
    }),
    getCalendarMonth: (year: number, month: number): CalendarMonthView =>
      getCalendarMonthView(ctx.db, requireProfile().id, year, month),
    getCalendarDay: (date: string): CalendarDayView =>
      getCalendarDayView(ctx.db, requireProfile().id, date),
    createTask: (input: CreateTaskInput): Task =>
      createManualTask(ctx.db, requireProfile().id, input, Date.now()),
    moveTask: (input: MoveTaskInput): Task =>
      rescheduleTask(ctx.db, requireProfile().id, input, Date.now())
  };
}

export type AppHandlers = ReturnType<typeof createHandlers>;

export function registerIpc(ipcMain: IpcMain, handlers: AppHandlers): void {
  ipcMain.handle(IPC.bootstrap, () => handlers.bootstrap());
  ipcMain.handle(IPC.onboarding, (_event, input: OnboardingInput) =>
    handlers.submitOnboarding(input)
  );
  ipcMain.handle(IPC.today, () => handlers.getToday());
  ipcMain.handle(IPC.completeTask, (_event, input: CompleteTaskInput) =>
    handlers.completeTask(input)
  );
  ipcMain.handle(IPC.checkIn, (_event, input: DailyLogInput) =>
    handlers.checkIn(input)
  );
  ipcMain.handle(IPC.tree, () => handlers.getTree());
  ipcMain.handle(IPC.exportBackup, () => handlers.exportBackup());
  ipcMain.handle(IPC.settings, () => handlers.getSettings());
  ipcMain.handle(IPC.calendarMonth, (_event, year: number, month: number) =>
    handlers.getCalendarMonth(year, month)
  );
  ipcMain.handle(IPC.calendarDay, (_event, date: string) =>
    handlers.getCalendarDay(date)
  );
  ipcMain.handle(IPC.createTask, (_event, input: CreateTaskInput) =>
    handlers.createTask(input)
  );
  ipcMain.handle(IPC.moveTask, (_event, input: MoveTaskInput) =>
    handlers.moveTask(input)
  );
}
