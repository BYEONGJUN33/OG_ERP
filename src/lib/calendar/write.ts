import "server-only";

import { EVENT_COLORS } from "@/lib/calendar/colors";
import { fail, ok, type Result } from "@/lib/result";

/**
 * 구글 캘린더에 일정을 넣는다.
 *
 * 화면(등록 창)만 포털이 그리고, 저장은 구글이 한다 — 반복·알림·초대·모바일 앱은
 * 그대로 구글 몫이다. Airtable 데이터를 여기로 보내지 마라. (원칙 9)
 */

const API = "https://www.googleapis.com/calendar/v3/calendars";
const TIME_ZONE = "Asia/Seoul";

export type NewEvent = {
  calendarId: string;
  title: string;
  allDay: boolean;
  /** YYYY-MM-DD */
  startDate: string;
  endDate: string;
  /** HH:MM. 종일이면 없다 */
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  /** 구글 일정 색 번호. 없으면 캘린더 색 */
  colorId?: string;
};

/** 종일 일정의 끝은 구글 규칙상 **다음 날**로 보낸다. 읽을 때 빼는 것과 짝이다. */
function nextDay(date: string): string {
  const time = Date.parse(`${date}T00:00:00Z`) + 86_400_000;
  return new Date(time).toISOString().slice(0, 10);
}

export async function createGoogleEvent(
  event: NewEvent,
  accessToken: string,
): Promise<Result<null>> {
  const body = {
    summary: event.title,
    location: event.location || undefined,
    description: event.description || undefined,
    colorId: EVENT_COLORS.some((color) => color.id === event.colorId)
      ? event.colorId
      : undefined,
    ...(event.allDay
      ? {
          start: { date: event.startDate },
          end: { date: nextDay(event.endDate) },
        }
      : {
          start: { dateTime: `${event.startDate}T${event.startTime}:00`, timeZone: TIME_ZONE },
          end: { dateTime: `${event.endDate}T${event.endTime}:00`, timeZone: TIME_ZONE },
        }),
  };

  const response = await fetch(`${API}/${encodeURIComponent(event.calendarId)}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (response.ok) return ok(null);
  if (response.status === 401) {
    return fail("구글 로그인이 만료됐다. 로그아웃했다가 다시 로그인해라.");
  }
  if (response.status === 403) {
    // 2026-10-01 이전에 로그인한 세션은 쓰기 권한이 없다.
    return fail("일정을 넣을 권한이 없다. 로그아웃했다가 다시 로그인해 권한에 동의해라.");
  }
  return fail(`구글 캘린더가 일정을 받지 않았다 (${response.status}).`);
}
