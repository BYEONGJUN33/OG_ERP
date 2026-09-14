const SEOUL = "Asia/Seoul";

/** 서버 시간대와 무관하게 한국 기준 오늘 날짜(YYYY-MM-DD) */
export function todayInSeoul(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** ISO 시각을 한국 기준 날짜(YYYY-MM-DD)로 */
export function seoulDate(iso: string): string {
  return todayInSeoul(new Date(iso));
}

/** 오늘 기준 남은 일수. 음수면 지난 것. */
export function daysUntil(date: string, today: string = todayInSeoul()): number {
  const ms = Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** 마감일을 사람이 읽는 짧은 문구로. */
export function dueLabel(date: string | null, today: string = todayInSeoul()): string {
  if (!date) return "기한 없음";
  const days = daysUntil(date, today);
  if (days === 0) return "오늘";
  if (days === 1) return "내일";
  if (days < 0) return `${-days}일 지남`;
  return `${days}일 남음`;
}
