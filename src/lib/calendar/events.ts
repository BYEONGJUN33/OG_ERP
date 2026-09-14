import "server-only";

import { getGoogleEvents } from "@/lib/calendar/sources/google";
import { byStart, type PortalEvent } from "@/lib/calendar/types";
import { fail, ok, type Result } from "@/lib/result";
import { auth } from "@/lib/auth";

/**
 * 모든 출처를 합쳐 돌려준다. 화면은 출처를 모른다.
 *
 * 출처를 더할 때는 아래 배열에 한 줄 더한다.
 * 다음 차례는 `sources/todos.ts` — 할 일 마감을 같은 화면에 겹친다.
 */

/** 모두가 함께 보는 캘린더. 본인 것은 로그인 이메일로 붙인다. */
function sharedCalendarIds(): string[] {
  return (process.env.GOOGLE_CALENDAR_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id !== "");
}

export function calendarIdsFor(email: string | null | undefined): string[] {
  const shared = sharedCalendarIds();
  const own = email?.trim().toLowerCase();
  if (!own || shared.some((id) => id.toLowerCase() === own)) return shared;
  return [...shared, own];
}

export async function getEvents(
  from: Date,
  to: Date,
): Promise<Result<PortalEvent[]>> {
  const session = await auth();

  if (!session?.accessToken) {
    return fail(
      session?.tokenError
        ? "구글 로그인이 만료됐다. 로그아웃했다가 다시 로그인해라."
        : "구글 캘린더 권한이 없다. 다시 로그인하면 동의 화면이 뜬다.",
    );
  }

  const ids = calendarIdsFor(session.user.email);
  if (ids.length === 0) return ok([]);

  try {
    const events = await getGoogleEvents(ids, session.accessToken, from, to);
    return ok(events.sort(byStart));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "일정을 읽지 못했다.");
  }
}
