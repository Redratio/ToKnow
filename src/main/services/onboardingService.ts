import type Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import type { OnboardingInput, Profile } from '../../shared/types';
import { getStudyDate } from '../../shared/date';
import { insertProfile } from '../repositories/profileRepo';
import { seedTargetTree } from '../seed/targetTree';

export function validateOnboarding(
  input: OnboardingInput,
  today = getStudyDate(new Date())
): string[] {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push('name_required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.examDate)) {
    errors.push('exam_date_invalid');
  } else if (input.examDate <= today) {
    errors.push('exam_date_past');
  }
  if (input.dailyCapacityMin < 60 || input.dailyCapacityMin > 900) {
    errors.push('capacity_range');
  }
  for (const value of Object.values(input.selfRatings)) {
    if (!Number.isFinite(value) || value < 0 || value > 5) {
      errors.push('rating_range');
      break;
    }
  }
  return errors;
}

export function submitOnboarding(
  db: Database.Database,
  input: OnboardingInput,
  today = getStudyDate(new Date())
): Profile {
  // P0 只支持单档案。重复提交会在种子数据的主键上撞车并留下旧档案，
  // 因此在任何写入之前明确拒绝。
  const existing = db
    .prepare(
      'SELECT 1 FROM study_profile WHERE deleted_at IS NULL LIMIT 1'
    )
    .get();
  if (existing) throw new Error('PROFILE_EXISTS');

  const errors = validateOnboarding(input, today);
  if (errors.length > 0) {
    throw new Error(`INVALID_ONBOARDING:${errors.join(',')}`);
  }

  const profile: Profile = {
    id: randomUUID(),
    name: input.name.trim(),
    examDate: input.examDate,
    dailyCapacityMin: input.dailyCapacityMin,
    timezone: 'Asia/Shanghai',
    active: true
  };

  const tx = db.transaction(() => {
    insertProfile(db, profile);
    seedTargetTree(db, profile.id);

    const updateState = db.prepare(
      `UPDATE user_node_state
       SET self_rating = ?, mastery = ?, confidence = 0.5, updated_by = 'self', updated_at = ?
       WHERE profile_id = ?
         AND node_id IN (
           SELECT n.id FROM knowledge_node n
           JOIN module m ON m.id = n.module_id
           JOIN subject s ON s.id = m.subject_id
           WHERE s.profile_id = ? AND s.code = ?
         )`
    );

    for (const [code, rating] of Object.entries(input.selfRatings)) {
      updateState.run(rating, rating, Date.now(), profile.id, profile.id, code);
    }
  });

  tx();
  return profile;
}
