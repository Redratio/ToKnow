import { daysBetween } from './date';

export interface PlannerNode {
  nodeId: string;
  moduleId: string;
  subjectId: string;
  title: string;
  examWeight: number;
  mastery: number;
  targetMastery: number;
  lastStudiedAt: number | null;
}

export interface PlannerInput {
  today: string;
  examDate: string;
  dailyCapacityMin: number;
  nowMs: number;
  nodes: PlannerNode[];
  maxTasks?: number;
}

export interface RankedNode extends PlannerNode {
  score: number;
}

export interface DailySelection {
  mainline: RankedNode;
  supporting: RankedNode[];
  plannedMin: number;
}

export function urgency(daysLeft: number): number {
  return 1 + Math.max(0, (90 - daysLeft) / 90);
}

export function forgetting(lastStudiedAt: number | null, nowMs: number): number {
  if (lastStudiedAt === null) return 1;
  const days = Math.max(0, (nowMs - lastStudiedAt) / 86_400_000);
  return 1 + Math.min(1, days / 14);
}

export function priority(node: PlannerNode, daysLeft: number, nowMs: number): number {
  const weakness = Math.max(0, 1 - node.mastery / 5);
  const targetGap = Math.max(0, (node.targetMastery - node.mastery) / 5);
  return (
    node.examWeight *
    (weakness + targetGap) *
    urgency(daysLeft) *
    forgetting(node.lastStudiedAt, nowMs)
  );
}

export function selectDailyPlan(input: PlannerInput): DailySelection | null {
  const daysLeft = daysBetween(input.today, input.examDate);
  const ranked: RankedNode[] = input.nodes
    .filter((node) => node.mastery < node.targetMastery)
    .map((node) => ({
      ...node,
      score: priority(node, daysLeft, input.nowMs)
    }))
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return null;

  const maxTasks = Math.max(1, input.maxTasks ?? 3);
  const picked = ranked.slice(0, maxTasks);
  const plannedMin = Math.max(
    10,
    Math.min(60, Math.floor(input.dailyCapacityMin / picked.length))
  );

  return {
    mainline: picked[0],
    supporting: picked.slice(1),
    plannedMin
  };
}
