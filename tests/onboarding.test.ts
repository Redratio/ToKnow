import { describe, expect, it } from 'vitest';
import { getActiveProfile } from '../src/main/repositories/profileRepo';
import {
  submitOnboarding,
  validateOnboarding
} from '../src/main/services/onboardingService';
import { makeTestDb } from './helpers/db';

const validInput = {
  name: '小明',
  examDate: '2026-12-19',
  dailyCapacityMin: 480,
  selfRatings: { math: 2, english: 3, politics: 0, '825': 1 }
};

describe('validateOnboarding', () => {
  it('accepts a valid input', () => {
    expect(validateOnboarding(validInput, '2026-10-18')).toEqual([]);
  });

  it('rejects empty name, past date, bad capacity and bad rating', () => {
    const errors = validateOnboarding(
      {
        name: '  ',
        examDate: '2026-10-01',
        dailyCapacityMin: 10,
        selfRatings: { math: 9 }
      },
      '2026-10-18'
    );
    expect(errors).toEqual(
      expect.arrayContaining([
        'name_required',
        'exam_date_past',
        'capacity_range',
        'rating_range'
      ])
    );
  });
});

describe('submitOnboarding', () => {
  it('creates profile, seeds tree and applies subject ratings', () => {
    const db = makeTestDb();
    const profile = submitOnboarding(db, validInput, '2026-10-18');

    expect(profile.examDate).toBe('2026-12-19');
    expect(getActiveProfile(db)?.id).toBe(profile.id);

    const counts = db
      .prepare('SELECT COUNT(*) AS c FROM subject WHERE profile_id = ?')
      .get(profile.id) as { c: number };
    expect(counts.c).toBe(4);

    const mathState = db
      .prepare(
        `SELECT AVG(uns.mastery) AS avg_mastery, AVG(uns.self_rating) AS avg_rating
         FROM user_node_state uns
         JOIN knowledge_node n ON n.id = uns.node_id
         JOIN module m ON m.id = n.module_id
         JOIN subject s ON s.id = m.subject_id
         WHERE uns.profile_id = ? AND s.code = 'math'`
      )
      .get(profile.id) as { avg_mastery: number; avg_rating: number };
    expect(mathState.avg_mastery).toBe(2);
    expect(mathState.avg_rating).toBe(2);

    db.close();
  });

  it('rejects a second onboarding without changing the database', () => {
    const db = makeTestDb();
    const first = submitOnboarding(db, validInput, '2026-10-18');
    const snapshot = () =>
      db
        .prepare(
          `SELECT
             (SELECT COUNT(*) FROM study_profile) AS profiles,
             (SELECT COUNT(*) FROM subject) AS subjects,
             (SELECT COUNT(*) FROM module) AS modules,
             (SELECT COUNT(*) FROM knowledge_node) AS nodes,
             (SELECT COUNT(*) FROM user_node_state) AS states`
        )
        .get();

    const before = snapshot();
    expect(() =>
      submitOnboarding(
        db,
        { ...validInput, name: '另一次引导' },
        '2026-10-18'
      )
    ).toThrow('PROFILE_EXISTS');
    expect(snapshot()).toEqual(before);
    expect(getActiveProfile(db)?.id).toBe(first.id);

    db.close();
  });
});
