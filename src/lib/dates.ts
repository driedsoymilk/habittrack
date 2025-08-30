export function toMidnightUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function startOfWeekUTC(ref: Date = new Date()) {
  const s = toMidnightUTC(ref);
  const day = s.getUTCDay();
  s.setUTCDate(s.getUTCDate() - day);
  return s;
}

export function endOfWeekUTC(ref: Date = new Date()) {
  const s = startOfWeekUTC(ref);
  const e = new Date(s);
  e.setUTCDate(e.getUTCDate() + 7);
  return e;
}

export function lastNDaysUTC(n: number, ref: Date = new Date()) {
  const end = toMidnightUTC(ref);
  const days: Date[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    days.push(d);
  }
  return days;
}
