/**
 * 일정 색. 서버·클라이언트 양쪽에서 쓴다(`server-only` 없음).
 *
 * 구글 일정 색 11가지 — 구글 캘린더 웹 화면에 보이는 그 색과 이름이다.
 * API의 `colors` 엔드포인트는 예전 옅은 색표를 돌려줘서 구글 화면과 달라 보인다.
 * 그래서 colorId → 색을 여기서 직접 맞춘다.
 */
export const EVENT_COLORS = [
  { id: "11", name: "토마토", hex: "#d50000" },
  { id: "4", name: "플라밍고", hex: "#e67c73" },
  { id: "6", name: "귤", hex: "#f4511e" },
  { id: "5", name: "바나나", hex: "#f6bf26" },
  { id: "2", name: "세이지", hex: "#33b679" },
  { id: "10", name: "바질", hex: "#0b8043" },
  { id: "7", name: "공작", hex: "#039be5" },
  { id: "9", name: "블루베리", hex: "#3f51b5" },
  { id: "1", name: "라벤더", hex: "#7986cb" },
  { id: "3", name: "포도", hex: "#8e24aa" },
  { id: "8", name: "흑연", hex: "#616161" },
] as const;

export function eventColorHex(colorId: string | undefined): string | undefined {
  return EVENT_COLORS.find((color) => color.id === colorId)?.hex;
}

/**
 * 공휴일 색. 구글 캘린더 색 설정과 상관없이 고정한다 —
 * 쉬는 날은 빨강, 쉬지 않는 기념일은 회색. 날짜 숫자도 같은 규칙을 따른다.
 */
export const OFF_DAY_RED = "#d93025";
export const OBSERVANCE_GRAY = "#8993a4";
export const SATURDAY_BLUE = "#1a73e8";
