/**
 * 일정 등록은 구글이 한다. 우리는 등록 화면으로 넘겨줄 뿐이다. (원칙 3)
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
  if (!primary) return null;

  const create = new URL("https://calendar.google.com/calendar/r/eventedit");
  create.searchParams.set("src", primary);
  create.searchParams.set("ctz", "Asia/Seoul");

  return (
    <div className="flex gap-2">
      <a
        href={`https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(primary)}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
      >
        구글 캘린더에서 열기
      </a>
      <a
        href={create.toString()}
        target="_blank"
        rel="noreferrer"
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700"
      >
        일정 추가
      </a>
    </div>
  );
}
