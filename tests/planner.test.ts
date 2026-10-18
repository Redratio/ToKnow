import { describe, expect, it } from 'vitest';
import {
  forgetting,
  priority,
  selectDailyPlan,
  urgency,
  type PlannerNode
} from '../src/shared/planner';

const now = Date.parse('2026-10-18T12:00:00+08:00');
const baseNode: PlannerNode = {
  nodeId: 'node-a',
  moduleId: 'mod-a',
  subjectId: 'sub-a',
  title: '动态电路暂态',
  examWeight: 70,
  mastery: 1,
  targetMastery: 4,
  lastStudiedAt: null
};

describe('urgency', () => {
  it('increases as the exam approaches', () => {
    expect(urgency(90)).toBe(1);
    expect(urgency(45)).toBe(1.5);
    expect(urgency(0)).toBe(2);
  });
});

describe('forgetting', () => {
  it('is neutral for never-studied nodes', () => {
    expect(forgetting(null, now)).toBe(1);
  });

  it('increases with days since last study, capped at 2', () => {
    const sevenDaysAgo = now - 7 * 86_400_000;
    expect(forgetting(sevenDaysAgo, now)).toBeCloseTo(1.5);
    const thirtyDaysAgo = now - 30 * 86_400_000;
    expect(forgetting(thirtyDaysAgo, now)).toBe(2);
  });
});

describe('priority', () => {
  it('prefers weaker, heavier and more urgent nodes', () => {
    const weak = { ...baseNode, mastery: 1 };
    const strong = { ...baseNode, mastery: 4 };
    expect(priority(weak, 30, now)).toBeGreaterThan(priority(strong, 30, now));

    const heavy = { ...baseNode, examWeight: 70 };
    const light = { ...baseNode, examWeight: 10 };
    expect(priority(heavy, 30, now)).toBeGreaterThan(priority(light, 30, now));

    expect(priority(baseNode, 10, now)).toBeGreaterThan(priority(baseNode, 80, now));
  });
});

describe('selectDailyPlan', () => {
  it('returns null when every node is mastered', () => {
    const mastered = { ...baseNode, mastery: 4 };
    expect(
      selectDailyPlan({
        today: '2026-10-18',
        examDate: '2026-12-19',
        dailyCapacityMin: 480,
        nowMs: now,
        nodes: [mastered]
      })
    ).toBeNull();
  });

  it('selects one mainline and up to two supporting tasks', () => {
    const nodes: PlannerNode[] = [
      { ...baseNode, nodeId: 'a', mastery: 0.5, examWeight: 70 },
      { ...baseNode, nodeId: 'b', mastery: 1, examWeight: 40 },
      { ...baseNode, nodeId: 'c', mastery: 2, examWeight: 20 },
      { ...baseNode, nodeId: 'd', mastery: 3, examWeight: 10 }
    ];
    const plan = selectDailyPlan({
      today: '2026-10-18',
      examDate: '2026-12-19',
      dailyCapacityMin: 480,
      nowMs: now,
      nodes
    });
    expect(plan?.mainline.nodeId).toBe('a');
    expect(plan?.supporting).toHaveLength(2);
    expect(plan?.plannedMin).toBe(60);
  });

  it('respects a smaller daily capacity', () => {
    const plan = selectDailyPlan({
      today: '2026-10-18',
      examDate: '2026-12-19',
      dailyCapacityMin: 90,
      nowMs: now,
      nodes: [
        { ...baseNode, nodeId: 'a' },
        { ...baseNode, nodeId: 'b' },
        { ...baseNode, nodeId: 'c' }
      ]
    });
    expect(plan?.plannedMin).toBe(30);
  });
});
