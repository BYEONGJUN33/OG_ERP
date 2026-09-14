/**
 * 주간 격자 계산. 날짜는 문자열(YYYY-MM-DD)로만 다룬다.
 */

/** 그 날짜가 속한 주(월요일 시작)의 7일 */
export function weekDays(date: string): string[] {
  const base = Date.parse(`${date}T00:00:00Z`);
  const weekday = new Date(base).getUTCDay(); // 0=일
  const monday = base - ((weekday + 6) % 7) * 86_400_000;

  return Array.from({ length: 7 }, (_, i) =>
    new Date(monday + i * 86_400_000).toISOString().slice(0, 10),
  );
}

export function weekRange(days: string[]): { from: Date; to: Date } {
  return {
    from: new Date(`${days[0]}T00:00:00+09:00`),
    to: new Date(`${days[6]}T23:59:59+09:00`),
  };
}

/** 한국 시간 기준 그 시각이 자정에서 몇 분 지났는지 */
export function minutesOfDay(iso: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  const [h, m] = parts.split(":").map(Number);
  return h * 60 + m;
}

/**
 * ISO 주차. 월요일이 주의 시작이고, 그 해 첫 목요일이 속한 주가 1주다.
 * 한국 회사에서 쓰는 '몇 주차'가 이 규칙이다.
 */
export function isoWeek(date: string): number {
  const day = new Date(`${date}T00:00:00Z`);
  // 그 주의 목요일로 옮긴 뒤 연초부터 몇 번째 주인지 센다.
  const weekday = (day.getUTCDay() + 6) % 7; // 월=0
  day.setUTCDate(day.getUTCDate() - weekday + 3);

  const firstThursday = new Date(Date.UTC(day.getUTCFullYear(), 0, 4));
  const firstWeekday = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstWeekday + 3);

  return (
    1 + Math.round((day.getTime() - firstThursday.getTime()) / (7 * 86_400_000))
  );
}
