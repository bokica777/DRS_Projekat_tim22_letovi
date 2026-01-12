export function getRemainingSeconds(
  departureTimeIso: string,
  durationMinutes: number
): number {
  const start = new Date(departureTimeIso).getTime();
  const end = start + durationMinutes * 60 * 1000;
  const now = Date.now();
  return Math.max(0, Math.floor((end - now) / 1000));
}

export function formatRemaining(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
