import "server-only";

import type { PortalEvent } from "@/lib/calendar/types";

/**
 * 구글 캘린더에서 일정을 읽는다. 읽기만 한다.
 *
 * `singleEvents=true`로 요청하면 **구글이 반복 일정을 펼쳐서** 준다.
 * 그래서 RRULE을 우리가 해석할 일이 없다. (원칙 3·9)
 */

const API = "https://www.googleapis.com/calendar/v3/calendars";

export class CalendarError extends Error {}

type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  location?: string;
  description?: string;
  htmlLink?: string;
  organizer?: { email?: string; displayName?: string };
  creator?: { email?: string; displayName?: string };
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

function toPortalEvent(event: GoogleEvent, calendarId: string): PortalEvent | null {
  const start = event.start?.dateTime ?? event.start?.date;
  if (!start) return null; // 시작이 없는 일정은 그릴 수 없다

  return {
    id: `google:${calendarId}:${event.id}`,
    title: event.summary?.trim() || "(제목 없음)",
    start,
    end: event.end?.dateTime ?? event.end?.date,
    allDay: Boolean(event.start?.date),
    source: "google",
    type: "구글일정",
    owner: event.creator?.displayName ?? event.creator?.email,
    location: event.location,
    description: event.description,
    href: event.htmlLink,
  };
}

async function fetchOne(
  calendarId: string,
  accessToken: string,
  from: Date,
  to: Date,
): Promise<PortalEvent[]> {
  const url = new URL(`${API}/${encodeURIComponent(calendarId)}/events`);
  url.searchParams.set("timeMin", from.toISOString());
  url.searchParams.set("timeMax", to.toISOString());
  url.searchParams.set("singleEvents", "true"); // 반복을 구글이 펼쳐 준다
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "250");
  url.searchParams.set("timeZone", "Asia/Seoul");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new CalendarError("구글 로그인이 만료됐다. 다시 로그인해라.");
  }
  if (response.status === 403) {
    throw new CalendarError(
      "구글 캘린더 접근이 거부됐다(403). Calendar API가 켜져 있는지, " +
        "로그인할 때 캘린더 권한에 동의했는지 확인해라.",
    );
  }
  if (response.status === 404) {
    // 없는 캘린더 하나 때문에 화면 전체가 비면 안 된다.
    return [];
  }
  if (!response.ok) {
    throw new CalendarError(`구글 캘린더 ${response.status} (${calendarId})`);
  }

  const body = (await response.json()) as { items?: GoogleEvent[] };

  return (body.items ?? [])
    .filter((event) => event.status !== "cancelled")
    .map((event) => toPortalEvent(event, calendarId))
    .filter((event): event is PortalEvent => event !== null);
}

export async function getGoogleEvents(
  calendarIds: string[],
  accessToken: string,
  from: Date,
  to: Date,
): Promise<PortalEvent[]> {
  const pages = await Promise.all(
    calendarIds.map((id) => fetchOne(id, accessToken, from, to)),
  );
  return pages.flat();
}
