/**
 * 달력 격자 계산. 날짜만 다루므로 문자열(YYYY-MM-DD)로 계산한다.
 * 시간대가 끼어들 여지를 아예 없애려는 것이다.
 */

/** "2026-09" → 그 달을 담는 6주 격자. 월요일 시작. */
export function monthGrid(year: number, month: number): string[][] {
  const first = Date.UTC(year, month - 1, 1);
  const weekday = new Date(first).getUTCDay(); // 0=일
  const offsetToMonday = (weekday + 6) % 7;

  const days: string[] = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(first + (i - offsetToMonday) * 86_400_000);
    days.push(day.toISOString().slice(0, 10));
  }

  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

/** 격자가 덮는 범위. 구글에 물어볼 기간이다. */
export function gridRange(weeks: string[][]): { from: Date; to: Date } {
  const first = weeks[0][0];
  const last = weeks[weeks.length - 1][6];
  return {
    from: new Date(`${first}T00:00:00+09:00`),
    to: new Date(`${last}T23:59:59+09:00`),
  };
}

/** "2026-09" 같은 값을 읽는다. 이상하면 이번 달. */
export function parseMonth(value: string | undefined, today: string): {
  year: number;
  month: number;
} {
  const source = value && /^\d{4}-\d{2}$/.test(value) ? value : today.slice(0, 7);
  const [year, month] = source.split("-").map(Number);
  if (month < 1 || month > 12) {
    const [y, m] = today.slice(0, 7).split("-").map(Number);
    return { year: y, month: m };
  }
  return { year, month };
}

export function shiftMonth(year: number, month: number, delta: number): string {
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

export const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];
