import { ComposeButton } from "@/components/event-composer";

/**
 * 일정 화면 머리의 버튼. 등록은 포털 창에서, 크게 볼 때만 구글로 간다.
 */
function primaryCalendarId(): string | null {
  const first = (process.env.GOOGLE_CALENDAR_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .find((id) => id !== "");
  return first ?? null;
}

export function CalendarLinks() {
  const primary = primaryCalendarId();

  return (
    <div className="flex gap-2">
      {primary ? (
        <a
          href={`https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(primary)}`}
          target="_blank"
          rel="noreferrer"
          className="btn py-1.5"
        >
          구글 캘린더에서 열기
        </a>
      ) : null}
      <ComposeButton className="btn-primary py-1.5" />
    </div>
  );
}
