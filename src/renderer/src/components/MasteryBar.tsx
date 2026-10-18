export default function MasteryBar({ mastery }: { mastery: number }) {
  const pct = Math.round((Math.min(5, Math.max(0, mastery)) / 5) * 100);
  return (
    <span className="mastery" title={`掌握度 ${mastery.toFixed(1)} / 5`}>
      <span className="mastery-fill" style={{ width: `${pct}%` }} />
    </span>
  );
}
