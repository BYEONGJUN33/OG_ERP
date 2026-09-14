import { EmptyState } from "@/components/data-state";

/**
 * 구글의 일정 만들기 화면 주소.
 * 등록 폼을 우리가 만들지 않는다 — 반복·장소·첨부·초대는 구글이 이미 준다. (원칙 3)
 */
function createEventUrl(calendarId: string): string {
  const url = new URL("https://calendar.google.com/calendar/r/eventedit");
  url.searchParams.set("src", calendarId);
  url.searchParams.set("ctz", "Asia/Seoul");
  return url.toString();
}

/**
 * 구글 캘린더 임베드. 1단계는 보기만 한다.
 * 반복 일정·공휴일·알림은 구글이 담당한다. (원칙 9)
 */
export function CalendarEmbed() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!calendarId) {
    return <EmptyState message="캘린더가 아직 연결되지 않았다. GOOGLE_CALENDAR_ID를 설정해라." />;
  }

  const src = new URL("https://calendar.google.com/calendar/embed");
  src.searchParams.set("src", calendarId);
  src.searchParams.set("ctz", "Asia/Seoul");
  src.searchParams.set("mode", "MONTH");
  src.searchParams.set("showTitle", "0");
  src.searchParams.set("showPrint", "0");
  src.searchParams.set("showTabs", "0");
  src.searchParams.set("showCalendars", "0");

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <a
          href={createEventUrl(calendarId)}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          일정 추가
        </a>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200">
      <iframe
        src={src.toString()}
        title="오픈가든 캘린더"
        className="h-[420px] w-full sm:h-[560px]"
        loading="lazy"
      />
      </div>
    </div>
  );
}
