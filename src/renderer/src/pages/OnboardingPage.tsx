import { useState } from 'react';
import type { Profile } from '../../../shared/types';
import { api } from '../api';

const SUBJECTS = [
  { code: 'math', label: '数学一' },
  { code: 'english', label: '英语一' },
  { code: 'politics', label: '政治' },
  { code: '825', label: '825 电气科学基础' }
];

const ERROR_TEXT: Record<string, string> = {
  name_required: '请填写称呼',
  exam_date_invalid: '考试日期格式应为 YYYY-MM-DD',
  exam_date_past: '考试日期必须晚于今天',
  capacity_range: '每日可用时间需在 60–900 分钟之间',
  rating_range: '自评需在 0–5 之间'
};

export default function OnboardingPage({
  onDone
}: {
  onDone: (profile: Profile) => void;
}) {
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('2026-12-19');
  const [dailyCapacityMin, setCapacity] = useState(480);
  const [ratings, setRatings] = useState<Record<string, number>>({
    math: 2,
    english: 3,
    politics: 0,
    '825': 1
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function submit(): Promise<void> {
    setSaving(true);
    setErrors([]);
    try {
      const profile = await api.submitOnboarding({
        name,
        examDate,
        dailyCapacityMin,
        selfRatings: ratings
      });
      onDone(profile);
    } catch (e) {
      const raw = String(e);
      if (raw.includes('PROFILE_EXISTS')) {
        setErrors(['本机已存在档案，不能重复完成引导。']);
        setSaving(false);
        return;
      }
      const codes = raw.includes('INVALID_ONBOARDING:')
        ? raw.split('INVALID_ONBOARDING:')[1].split(',')
        : [];
      setErrors(
        codes.length > 0
          ? codes.map((c) => ERROR_TEXT[c] ?? c)
          : ['保存失败，请检查输入后重试']
      );
      setSaving(false);
    }
  }

  return (
    <div className="onboarding">
      <div className="onboarding-card">
        <div className="brand">ToKnow</div>
        <h1>先把目标定清楚</h1>
        <p className="muted">
          这些信息只保存在本机。请确认无误；当前版本暂不支持在设置里修改。
        </p>

        <label>
          怎么称呼你
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          考试日期
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </label>

        <label>
          每天可用时间（分钟）
          <input
            type="number"
            min={60}
            max={900}
            value={dailyCapacityMin}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </label>

        <fieldset>
          <legend>四科当前自评（0 = 没开始，5 = 很有把握）</legend>
          {SUBJECTS.map((subject) => (
            <label key={subject.code} className="rating-row">
              <span>{subject.label}</span>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={ratings[subject.code]}
                onChange={(e) =>
                  setRatings({ ...ratings, [subject.code]: Number(e.target.value) })
                }
              />
              <span className="rating-value">{ratings[subject.code]}</span>
            </label>
          ))}
        </fieldset>

        {errors.length > 0 && (
          <ul className="errors">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <button className="primary" disabled={saving} onClick={() => void submit()}>
          {saving ? '正在建立目标树…' : '开始'}
        </button>
      </div>
    </div>
  );
}
