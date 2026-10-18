export type NodeKind = 'chapter' | 'section' | 'point';
export type TaskStatus = 'todo' | 'doing' | 'done' | 'skipped' | 'blocked';
export type TaskType = 'study' | 'review' | 'practice' | 'memorize' | 'mock' | 'other';

export interface Profile {
  id: string;
  name: string;
  examDate: string;
  dailyCapacityMin: number;
  timezone: string;
  active: boolean;
}

export interface Subject {
  id: string;
  profileId: string;
  name: string;
  code: string;
  examWeight: number;
  color: string;
  orderIndex: number;
}

export interface Module {
  id: string;
  subjectId: string;
  name: string;
  examWeight: number;
  orderIndex: number;
}

export interface KnowledgeNode {
  id: string;
  moduleId: string;
  parentId: string | null;
  title: string;
  kind: NodeKind;
  examWeight: number;
  difficulty: number;
  targetMastery: number;
  orderIndex: number;
  syllabusVersion: string;
  description: string | null;
}

export interface UserNodeState {
  nodeId: string;
  selfRating: number;
  mastery: number;
  confidence: number;
  lastStudiedAt: number | null;
  nextReviewAt: number | null;
  reviewCount: number;
  updatedBy: 'self' | 'evidence' | 'mixed';
  updatedAt: number;
}

export interface Task {
  id: string;
  profileId: string;
  title: string;
  type: TaskType;
  plannedMin: number;
  actualMin: number | null;
  scheduledDate: string;
  status: TaskStatus;
  priorityScore: number;
  isMainline: boolean;
  source: 'manual' | 'plan' | 'llm' | 'journal';
  locked: boolean;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface DailyLog {
  id: string;
  profileId: string;
  date: string;
  sleepHours: number | null;
  energy: number | null;
  mood: number | null;
  focusSelf: number | null;
  note: string | null;
  checkinAt: number;
}

export interface TreeNode extends KnowledgeNode {
  state: UserNodeState;
  children: TreeNode[];
}

export interface TreeModule extends Module {
  nodes: TreeNode[];
}

export interface TreeSubject extends Subject {
  modules: TreeModule[];
}

export interface DailyPlan {
  date: string;
  mainline: Task | null;
  supporting: Task[];
  totalPlannedMin: number;
}

export interface OnboardingInput {
  name: string;
  examDate: string;
  dailyCapacityMin: number;
  selfRatings: Record<string, number>;
}

export interface DailyLogInput {
  date: string;
  sleepHours: number | null;
  energy: number | null;
  mood: number | null;
  focusSelf: number | null;
  note?: string | null;
}

export interface CompleteTaskInput {
  taskId: string;
  actualMin: number;
  performance: number;
}

export interface CalendarDay {
  date: string;
  taskCount: number;
  doneCount: number;
  plannedMin: number;
  hasCheckIn: boolean;
}

export interface CalendarMonthView {
  year: number;
  month: number; // 1–12
  days: CalendarDay[];
  tasks: Task[];
}

export interface CalendarDayView {
  date: string;
  tasks: Task[];
  dailyLog: DailyLog | null;
}

export interface CreateTaskInput {
  title: string;
  date: string;
  plannedMin: number;
  nodeId?: string | null;
}

export interface MoveTaskInput {
  taskId: string;
  date: string;
}
