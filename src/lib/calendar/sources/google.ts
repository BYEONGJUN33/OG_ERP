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

/** 캘린더별 기본색 + 일정별 지정색. 구글에서 정한 색을 그대로 쓰려고 읽는다. */
type Palette = {
  /** colorId -> hex. 사용자가 일정 하나에 따로 지정한 색 */
  event: Record<string, string>;
  /** calendarId -> hex. 캘린더 자체의 색 */
  calendar: Record<string, string>;
};

async function fetchJson<T>(url: string, accessToken: string): Promise<T | null> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    // 색을 바꾸면 곧 반영돼야 한다. 색표는 가벼우니 짧게 잡는다.
    next: { revalidate: 60 },
  });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

/**
 * 색표를 읽는다. 실패해도 일정은 보여야 하므로 빈 표를 돌려준다 —
 * 색이 없으면 회색으로 그릴 뿐 화면이 죽지는 않는다.
 */
async function getPalette(accessToken: string): Promise<Palette> {
  const [colors, list] = await Promise.all([
    fetchJson<{ event?: Record<string, { background?: string }> }>(
      "https://www.googleapis.com/calendar/v3/colors",
      accessToken,
    ),
    fetchJson<{ items?: { id: string; backgroundColor?: string }[] }>(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      accessToken,
    ),
  ]);

  const event: Record<string, string> = {};
  for (const [id, value] of Object.entries(colors?.event ?? {})) {
    if (value.background) event[id] = value.background;
  }

  const calendar: Record<string, string> = {};
  for (const item of list?.items ?? []) {
    if (item.backgroundColor) calendar[item.id] = item.backgroundColor;
  }

  return { event, calendar };
}

type GoogleEvent = {
  id: string;
  status?: string;
  summary?: string;
  colorId?: string;
  location?: string;
  description?: string;
  htmlLink?: string;
  organizer?: { email?: string; displayName?: string };
  creator?: { email?: string; displayName?: string };
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

function toPortalEvent(
  event: GoogleEvent,
  calendarId: string,
  palette: Palette,
): PortalEvent | null {
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
    // 일정에 색을 따로 지정했으면 그 색, 아니면 캘린더 색.
    color:
      (event.colorId ? palette.event[event.colorId] : undefined) ??
      palette.calendar[calendarId],
  };
}

async function fetchOne(
  calendarId: string,
  accessToken: string,
  from: Date,
  to: Date,
  palette: Palette,
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
    .map((event) => toPortalEvent(event, calendarId, palette))
    .filter((event): event is PortalEvent => event !== null);
}

export async function getGoogleEvents(
  calendarIds: string[],
  accessToken: string,
  from: Date,
  to: Date,
): Promise<PortalEvent[]> {
  const palette = await getPalette(accessToken);
  const pages = await Promise.all(
    calendarIds.map((id) => fetchOne(id, accessToken, from, to, palette)),
  );
  return pages.flat();
}
