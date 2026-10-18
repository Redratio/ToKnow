import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent
} from 'react';
import { Link } from 'react-router-dom';
import { getStudyDate } from '../../../shared/date';
import type {
  CalendarDayView,
  CalendarMonthView,
  Task
} from '../../../shared/types';
import { api } from '../api';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function reasonOf(error: unknown): string {
  const raw = String(error);
  const marker = raw.lastIndexOf('Error: ');
  return marker >= 0 ? raw.slice(marker + 7) : raw;
}

export default function CalendarPage() {
  const today = getStudyDate(new Date());
  const [cursor, setCursor] = useState(() => {
    const [year, month] = today.split('-').map(Number);
    return { year, month };
  });
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState<CalendarMonthView | null>(null);
  const [day, setDay] = useState<CalendarDayView | null>(null);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(45);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef({ cursor, selectedDate });
  const requestId = useRef(0);
  selectionRef.current = { cursor, selectedDate };

  const refresh = useCallback(async () => {
    const { cursor: at, selectedDate: on } = selectionRef.current;
    const id = ++requestId.current;
    try {
      const [monthView, dayView] = await Promise.all([
        api.getCalendarMonth(at.year, at.month),
        api.getCalendarDay(on)
      ]);
      if (id !== requestId.current) return;
      setMonth(monthView);
      setDay(dayView);
      setLoadError(null);
    } catch (e) {
      if (id !== requestId.current) return;
      setLoadError(`读取日历失败：${reasonOf(e)}`);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [cursor.year, cursor.month, selectedDate, refresh]);

  function goMonth(delta: number) {
    const next = new Date(cursor.year, cursor.month - 1 + delta, 1);
    const year = next.getFullYear();
    const monthIndex = next.getMonth() + 1;
    setCursor({ year, month: monthIndex });
    setSelectedDate(`${year}-${pad(monthIndex)}-01`);
    setMessage(null);
    setError(null);
  }

  function goToday() {
    const [year, monthIndex] = today.split('-').map(Number);
    setCursor({ year, month: monthIndex });
    setSelectedDate(today);
    setMessage(null);
    setError(null);
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (creating) return;
    setMessage(null);
    setError(null);
    setCreating(true);
    try {
      await api.createTask({ title, date: selectedDate, plannedMin: minutes });
      setTitle('');
      await refresh();
      setMessage('已添加到这一天');
    } catch (err) {
      setError(`添加失败：${reasonOf(err)}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleComplete(task: Task) {
    if (task.status === 'done' || completingId !== null) return;
    setMessage(null);
    setError(null);
    setCompletingId(task.id);
    try {
      await api.completeTask({
        taskId: task.id,
        actualMin: task.plannedMin,
        performance: 3
      });
      await refresh();
    } catch (err) {
      setError(`完成失败：${reasonOf(err)}`);
    } finally {
      setCompletingId(null);
    }
  }

  async function handleMove(taskId: string, date: string) {
    if (moving) return;
    setMessage(null);
    setError(null);
    setMoving(true);
    try {
      await api.moveTask({ taskId, date });
      await refresh();
      setMessage('已改期');
    } catch (err) {
      setError(`改期失败：${reasonOf(err)}`);
    } finally {
      setMoving(false);
    }
  }

  const offset = month
    ? (new Date(month.year, month.month - 1, 1).getDay() + 6) % 7
    : 0;

  if (loadError && !month) {
    return <div className="center-note">{loadError}</div>;
  }
  if (!month) {
    return <div className="center-note">正在读取日历…</div>;
  }

  return (
    <div className="page calendar-page">
      <div className="page-head calendar-head">
        <div>
          <h1>日历</h1>
          <p className="muted">
            点选一天查看安排；双击日期把光标放到新任务；把任务拖到另一天即可改期。
          </p>
        </div>
        <div className="calendar-nav">
          <button onClick={() => goMonth(-1)} aria-label="上个月">‹</button>
          <strong>{cursor.year} 年 {cursor.month} 月</strong>
          <button onClick={() => goMonth(1)} aria-label="下个月">›</button>
          <button onClick={goToday}>今天</button>
        </div>
      </div>

      {loadError && <p className="form-error">{loadError}</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="calendar-layout">
        <section className="calendar-grid" aria-label="月历">
          {WEEKDAYS.map((weekday) => (
            <div key={weekday} className="cal-weekday">{weekday}</div>
          ))}
          {Array.from({ length: offset }, (_, index) => (
            <div key={`blank-${index}`} className="cal-cell blank" />
          ))}
          {month.days.map((entry) => (
            <button
              key={entry.date}
              type="button"
              className={`cal-cell${entry.date === selectedDate ? ' selected' : ''}${entry.date === today ? ' today' : ''}`}
              onClick={() => setSelectedDate(entry.date)}
              onDoubleClick={() => {
                setSelectedDate(entry.date);
                titleRef.current?.focus();
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const taskId = event.dataTransfer.getData('text/task-id');
                if (taskId) void handleMove(taskId, entry.date);
              }}
            >
              <span className="cal-date">{Number(entry.date.slice(8))}</span>
              {entry.hasCheckIn && <span className="cal-dot" title="已打卡" />}
              <span className="cal-count">
                {entry.taskCount > 0 ? `${entry.doneCount}/${entry.taskCount}` : ''}
              </span>
              <span
                className="cal-load"
                style={{ width: `${Math.min(100, entry.plannedMin / 6)}%` }}
              />
            </button>
          ))}
        </section>

        <aside className="calendar-day">
          <div className="calendar-day-head">
            <h2>{selectedDate}</h2>
            <span className="muted">{day?.dailyLog ? '已打卡' : '未打卡'}</span>
          </div>

          {day && day.tasks.length === 0 && (
            <p className="empty">这一天还没有安排。先加一件具体的事。</p>
          )}

          <ul className="cal-task-list">
            {day?.tasks.map((task) => (
              <li
                key={task.id}
                className={`cal-task${task.status === 'done' ? ' done' : ''}`}
                draggable={!moving}
                onDragStart={(event) =>
                  event.dataTransfer.setData('text/task-id', task.id)
                }
              >
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  disabled={task.status === 'done' || completingId !== null}
                  onChange={() => void handleComplete(task)}
                  aria-label={`完成 ${task.title}`}
                />
                <span className="cal-task-title">{task.title}</span>
                <span className="cal-task-min">
                  {completingId === task.id ? '记录中…' : `${task.plannedMin}′`}
                </span>
              </li>
            ))}
          </ul>

          <form className="cal-form" onSubmit={handleCreate}>
            <label>
              新任务
              <input
                ref={titleRef}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例如：电路第三章错题 1–10"
                maxLength={120}
                required
              />
            </label>
            <label>
              计划分钟
              <input
                type="number"
                min={5}
                max={600}
                value={minutes}
                onChange={(event) => setMinutes(Number(event.target.value))}
              />
            </label>
            <button className="primary" type="submit" disabled={creating}>
              {creating ? '添加中…' : '加到这一天'}
            </button>
          </form>

          {message && <p className="message">{message}</p>}
          <p className="muted">
            打卡在<Link to="/">今日</Link>完成；勾选任务会按计划时长记一条弱证据。
          </p>
        </aside>
      </div>
    </div>
  );
}
