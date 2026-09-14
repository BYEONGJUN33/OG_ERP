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

/** 구글 캘린더에서 직접 열기. 임베드가 비면 여기서 원인을 가른다. */
function openCalendarUrl(calendarId: string): string {
  return `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(calendarId)}`;
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

  // 캘린더 ID 자체가 잘못 들어간 경우를 눈으로 바로 가른다.
  // https:// 나 <iframe 이 들어 있으면 설정 화면에서 엉뚱한 값을 복사한 것이다.
  const looksWrong = /^https?:|<iframe|\s/.test(calendarId);

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
      <div className="mb-2 flex justify-end gap-2">
        <a
          href={openCalendarUrl(calendarId)}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          구글 캘린더에서 열기
        </a>
        <a
          href={createEventUrl(calendarId)}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          일정 추가
        </a>
      </div>

      {looksWrong ? (
        <p className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          GOOGLE_CALENDAR_ID가 캘린더 ID로 보이지 않는다. 구글 캘린더 설정의
          &quot;캘린더 통합 → 캘린더 ID&quot; 값만 넣어야 한다. 삽입 코드나 공개 URL이
          아니다.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-neutral-200">
      <iframe
        src={src.toString()}
        title="오픈가든 캘린더"
        className="h-[420px] w-full sm:h-[560px]"
        loading="lazy"
      />
      </div>

      <p className="mt-2 text-right text-xs break-all text-neutral-400">
        {calendarId}
      </p>
    </div>
  );
}
