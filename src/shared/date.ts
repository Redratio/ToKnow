export function getStudyDate(now: Date, boundaryHour = 4): string {
  const d = new Date(now.getTime());
  if (d.getHours() < boundaryHour) {
    d.setDate(d.getDate() - 1);
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(fromDate: string, toDate: string): number {
  const from = Date.parse(`${fromDate}T00:00:00`);
  const to = Date.parse(`${toDate}T00:00:00`);
  return Math.max(0, Math.round((to - from) / 86_400_000));
}
