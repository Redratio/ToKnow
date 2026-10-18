import type {
  DailyLog,
  KnowledgeNode,
  Module,
  Profile,
  Subject,
  Task,
  UserNodeState
} from '../../shared/types';

export interface ProfileRow {
  id: string;
  name: string;
  exam_date: string;
  daily_capacity_min: number;
  timezone: string;
  active: number;
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    examDate: row.exam_date,
    dailyCapacityMin: row.daily_capacity_min,
    timezone: row.timezone,
    active: row.active === 1
  };
}

export interface SubjectRow {
  id: string;
  profile_id: string;
  name: string;
  code: string;
  exam_weight: number;
  color: string;
  order_index: number;
}

export function mapSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    code: row.code,
    examWeight: row.exam_weight,
    color: row.color,
    orderIndex: row.order_index
  };
}

export interface ModuleRow {
  id: string;
  subject_id: string;
  name: string;
  exam_weight: number;
  order_index: number;
}

export function mapModule(row: ModuleRow): Module {
  return {
    id: row.id,
    subjectId: row.subject_id,
    name: row.name,
    examWeight: row.exam_weight,
    orderIndex: row.order_index
  };
}

export interface NodeRow {
  id: string;
  module_id: string;
  parent_id: string | null;
  title: string;
  kind: 'chapter' | 'section' | 'point';
  exam_weight: number;
  difficulty: number;
  target_mastery: number;
  order_index: number;
  syllabus_version: string;
  description: string | null;
}

export function mapNode(row: NodeRow): KnowledgeNode {
  return {
    id: row.id,
    moduleId: row.module_id,
    parentId: row.parent_id,
    title: row.title,
    kind: row.kind,
    examWeight: row.exam_weight,
    difficulty: row.difficulty,
    targetMastery: row.target_mastery,
    orderIndex: row.order_index,
    syllabusVersion: row.syllabus_version,
    description: row.description
  };
}

export interface StateRow {
  node_id: string;
  self_rating: number;
  mastery: number;
  confidence: number;
  last_studied_at: number | null;
  next_review_at: number | null;
  review_count: number;
  updated_by: 'self' | 'evidence' | 'mixed';
  updated_at: number;
}

export function mapState(row: StateRow): UserNodeState {
  return {
    nodeId: row.node_id,
    selfRating: row.self_rating,
    mastery: row.mastery,
    confidence: row.confidence,
    lastStudiedAt: row.last_studied_at,
    nextReviewAt: row.next_review_at,
    reviewCount: row.review_count,
    updatedBy: row.updated_by,
    updatedAt: row.updated_at
  };
}

export interface TaskRow {
  id: string;
  profile_id: string;
  title: string;
  type: Task['type'];
  planned_min: number;
  actual_min: number | null;
  scheduled_date: string;
  status: Task['status'];
  priority_score: number;
  is_mainline: number;
  source: Task['source'];
  locked: number;
  notes: string | null;
  created_at: number;
  updated_at: number;
}

export function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    type: row.type,
    plannedMin: row.planned_min,
    actualMin: row.actual_min,
    scheduledDate: row.scheduled_date,
    status: row.status,
    priorityScore: row.priority_score,
    isMainline: row.is_mainline === 1,
    source: row.source,
    locked: row.locked === 1,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export interface DailyLogRow {
  id: string;
  profile_id: string;
  date: string;
  sleep_hours: number | null;
  energy: number | null;
  mood: number | null;
  focus_self: number | null;
  note: string | null;
  checkin_at: number;
}

export function mapDailyLog(row: DailyLogRow): DailyLog {
  return {
    id: row.id,
    profileId: row.profile_id,
    date: row.date,
    sleepHours: row.sleep_hours,
    energy: row.energy,
    mood: row.mood,
    focusSelf: row.focus_self,
    note: row.note,
    checkinAt: row.checkin_at
  };
}
