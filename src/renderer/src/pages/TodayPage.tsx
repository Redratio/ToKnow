import { useEffect, useState } from 'react';
import type { Task, TodayView } from '../../../shared/types';
import { api } from '../api';

function TaskCard({
  task,
  mainline,
  onDone
}: {
  task: Task;
  mainline: boolean;
  onDone: () => void;
}) {
  const [minutes, setMinutes] = useState(task.plannedMin);
  const [performance, setPerformance] = useState(3);
  const [busy, setBusy] = useState(false);

  async function complete(): Promise<void> {
    setBusy(true);
    try {
      await api.completeTask({
        taskId: task.id,
        actualMin: minutes,
        performance
      });
      onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={mainline ? 'task-card mainline' : 'task-card'}>
      <div className="task-head">
        <span className={`tag ${mainline ? 'tag-main' : ''}`}>
          {mainline ? '主线' : '配套'}
        </span>
        <h3>{task.title}</h3>
        <span className="muted">{task.plannedMin} 分钟</span>
      </div>
      {task.status === 'done' ? (
        <p className="done-note">已完成 · 实际 {task.actualMin} 分钟</p>
      ) : (
        <div className="task-actions">
          <label>
            实际分钟
            <input
              type="number"
              min={0}
              max={600}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </label>
          <label>
            完成质量（1–5）
            <input
              type="number"
              min={1}
              max={5}
              value={performance}
              onChange={(e) => setPerformance(Number(e.target.value))}
            />
          </label>
          <button className="primary" disabled={busy} onClick={() => void complete()}>
            {busy ? '记录中…' : '标记完成'}
          </button>
        </div>
      )}
    </article>
  );
}

export default function TodayPage() {
  const [view, setView] = useState<TodayView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sleep, setSleep] = useState('');
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [focus, setFocus] = useState(3);
  const [note, setNote] = useState('');

  function load(): void {
    api
      .getToday()
      .then((next) => {
        setView(next);
        if (next.dailyLog) {
          setSleep(next.dailyLog.sleepHours?.toString() ?? '');
          setEnergy(next.dailyLog.energy ?? 3);
          setMood(next.dailyLog.mood ?? 3);
          setFocus(next.dailyLog.focusSelf ?? 3);
          setNote(next.dailyLog.note ?? '');
        }
      })
      .catch((e: unknown) => setError(String(e)));
  }

  useEffect(load, []);

  async function checkIn(): Promise<void> {
    if (!view) return;
    await api.checkIn({
      date: view.date,
      sleepHours: sleep === '' ? null : Number(sleep),
      energy,
      mood,
      focusSelf: focus,
      note: note.trim() === '' ? null : note.trim()
    });
    load();
  }

  if (error) return <div className="center-note">读取今日计划失败：{error}</div>;
  if (!view) return <div className="center-note">正在读取今日计划…</div>;

  return (
    <section className="page">
      <div className="page-head">
        <div>
          <h1>今天只做这一条主线</h1>
          <p className="muted">
            距考试 {view.daysLeft} 天 · 已完成 {view.completedCount}/{view.totalCount}
          </p>
        </div>
      </div>

      {view.plan.mainline ? (
        <TaskCard task={view.plan.mainline} mainline onDone={load} />
      ) : (
        <div className="empty">今天的计划已清空。休息，或做一次自由复习。</div>
      )}

      {view.plan.supporting.length > 0 && (
        <div className="supporting">
          <h2>配套</h2>
          {view.plan.supporting.map((task) => (
            <TaskCard key={task.id} task={task} mainline={false} onDone={load} />
          ))}
        </div>
      )}

      <section className="checkin">
        <h2>今日打卡</h2>
        <div className="checkin-grid">
          <label>
            睡眠（小时）
            <input
              type="number"
              min={0}
              max={24}
              step={0.5}
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
            />
          </label>
          <label>
            精力
            <input
              type="range"
              min={1}
              max={5}
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
            />
            <span>{energy}</span>
          </label>
          <label>
            心情
            <input
              type="range"
              min={1}
              max={5}
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
            />
            <span>{mood}</span>
          </label>
          <label>
            专注
            <input
              type="range"
              min={1}
              max={5}
              value={focus}
              onChange={(e) => setFocus(Number(e.target.value))}
            />
            <span>{focus}</span>
          </label>
        </div>
        <label>
          一句话记录（可选，只给你自己看）
          <textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button className="secondary" onClick={() => void checkIn()}>
          {view.dailyLog ? '更新打卡' : '保存打卡'}
        </button>
      </section>
    </section>
  );
}
