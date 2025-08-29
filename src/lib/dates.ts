export function startOfWeekUTC(d = new Date()) {
  // Make a copy in UTC
  const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  // Get weekday (0 = Sun … 6 = Sat). Choose Monday-start if you prefer.
  const day = utc.getUTCDay(); // Sunday-start week
  const diff = day;            // days since Sunday
  utc.setUTCDate(utc.getUTCDate() - diff);
  // normalize to midnight UTC
  return new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
}

export function endOfWeekUTC(d = new Date()) {
  const start = startOfWeekUTC(d);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7); // exclusive upper bound
  return end;
}


export function toMidnightUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function lastNDaysUTC(n: number, ref = new Date()) {
  const days: Date[] = [];
  const end = toMidnightUTC(ref);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    days.push(d);
  }
  return days;
}

export function sameDayUTC(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}
