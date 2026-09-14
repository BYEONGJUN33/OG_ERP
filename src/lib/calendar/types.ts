/**
 * 화면이 다루는 일정의 공통 모양.
 * 출처가 달라도 화면은 이 타입 하나만 안다. (원칙 9)
 *
 * 새 출처를 더할 때 = `sources/`에 파일 하나 + 등록 한 줄.
 * 그보다 많이 고쳐야 한다면 설계가 틀린 것이다.
 */
export type PortalEventType = "구글일정" | "할일" | "연차" | "휴가" | "출장";

export type PortalEvent = {
  id: string;
  title: string;
  /** 종일 일정은 YYYY-MM-DD, 시간 일정은 ISO */
  start: string;
  end?: string;
  allDay: boolean;
  source: "google" | "airtable";
  type: PortalEventType;
  owner?: string;
  location?: string;
  description?: string;
  /** 원본으로 가는 링크 */
  href?: string;
  /**
   * 막대 색(hex). 구글 일정은 사용자가 구글에서 지정한 색을 그대로 쓴다 —
   * 공휴일은 빨강, 박람회는 노랑처럼 규칙을 바꾸려고 코드를 고칠 이유가 없다.
   */
  color?: string;
};

/** 한국 기준 날짜(YYYY-MM-DD). 달력 칸에 넣을 때 쓴다. */
export function eventDate(value: string): string {
  if (value.length === 10) return value; // 이미 YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

/** 시작 시각 순. 종일 일정이 먼저 온다. */
export function byStart(a: PortalEvent, b: PortalEvent): number {
  if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
  return a.start.localeCompare(b.start);
}

/**
 * 일정이 덮는 날짜 범위(양끝 포함).
 *
 * 구글의 종일 일정은 끝 날짜가 **다음 날**로 온다(9/14 하루짜리면 end=9/15).
 * 그대로 쓰면 하루씩 길게 그려지므로 하루를 뺀다.
 */
export function eventRange(event: PortalEvent): { start: string; end: string } {
  const start = eventDate(event.start);
  if (!event.end) return { start, end: start };

  let end = eventDate(event.end);
  if (event.allDay) {
    const previous = new Date(`${end}T00:00:00Z`);
    previous.setUTCDate(previous.getUTCDate() - 1);
    end = previous.toISOString().slice(0, 10);
  }

  return { start, end: end < start ? start : end };
}
