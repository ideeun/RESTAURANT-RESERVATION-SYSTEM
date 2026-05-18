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
