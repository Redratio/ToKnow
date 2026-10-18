import type {
  BackupResult,
  CompleteTaskInput,
  CompleteTaskResult,
  DailyLog,
  DailyLogInput,
  OnboardingInput,
  Profile,
  TodayView,
  TreeSubject
} from './types';

export const IPC = {
  bootstrap: 'app:bootstrap',
  onboarding: 'profile:onboarding',
  today: 'plan:today',
  completeTask: 'task:complete',
  checkIn: 'log:checkin',
  tree: 'tree:get',
  exportBackup: 'backup:export',
  settings: 'app:settings'
} as const;

export interface Bootstrap {
  profile: Profile | null;
  today: string;
}

export interface AppSettings {
  dbPath: string;
  backupDir: string;
  version: string;
}

export interface AppApi {
  bootstrap(): Promise<Bootstrap>;
  submitOnboarding(input: OnboardingInput): Promise<Profile>;
  getToday(): Promise<TodayView>;
  completeTask(input: CompleteTaskInput): Promise<CompleteTaskResult>;
  checkIn(input: DailyLogInput): Promise<DailyLog>;
  getTree(): Promise<TreeSubject[]>;
  exportBackup(): Promise<BackupResult>;
  getSettings(): Promise<AppSettings>;
}
