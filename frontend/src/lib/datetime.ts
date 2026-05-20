/** Builds ISO local date-time string for API (no timezone offset). */
export function toApiDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

export function defaultSearchDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function defaultSearchTime(): string {
  return "19:00";
}

/** Локальные дата (yyyy-MM-dd) и время (HH:mm) для полей выбора интервала. */
export function localDateTimeParts(d: Date = new Date()): { date: string; time: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}
