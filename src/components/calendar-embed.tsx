import { EmptyState } from "@/components/data-state";

/**
 * 구글 캘린더 임베드. 1단계는 보기만 한다.
 * 반복 일정·공휴일·알림은 구글이 담당한다. (원칙 9)
 *
 * 캘린더는 한 화면에 겹쳐 본다. 다만 출처는 여럿이다 —
 * 공용 캘린더 + 대한민국 공휴일, 그리고 보는 사람 본인의 캘린더.
 *
 * `GOOGLE_CALENDAR_ID`에는 **모두가 함께 보는 것만** 쉼표로 나열한다.
 * 개인 캘린더는 여기 넣지 마라 — 넣으면 남의 개인 일정이 모두에게 보이고,
 * 서로 공유해두지 않은 사람 화면에서는 빈 칸으로만 나온다.
 * 본인 캘린더는 로그인한 이메일로 코드가 붙인다.
 *
 * 맨 앞이 기본 캘린더고 [일정 추가]는 거기에 만든다.
 */
function sharedCalendarIds(): string[] {
  return (process.env.GOOGLE_CALENDAR_ID ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id !== "");
}

function embedUrl(ids: string[]): string {
  const url = new URL("https://calendar.google.com/calendar/embed");
  for (const id of ids) url.searchParams.append("src", id);
  url.searchParams.set("ctz", "Asia/Seoul");
  url.searchParams.set("mode", "MONTH");
  url.searchParams.set("wkst", "1"); // 월요일 시작
  url.searchParams.set("showTitle", "0");
  url.searchParams.set("showPrint", "0");
  url.searchParams.set("showTabs", "0");
  url.searchParams.set("showCalendars", "0");
  return url.toString();
}

/** 구글의 일정 만들기 화면. 등록 폼을 우리가 만들지 않는다. (원칙 3) */
function createEventUrl(primary: string): string {
  const url = new URL("https://calendar.google.com/calendar/r/eventedit");
  url.searchParams.set("src", primary);
  url.searchParams.set("ctz", "Asia/Seoul");
  return url.toString();
}

function openCalendarUrl(primary: string): string {
  return `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(primary)}`;
}

export function CalendarEmbed({ viewerEmail }: { viewerEmail?: string | null }) {
  const shared = sharedCalendarIds();

  // 본인 캘린더를 마지막에 얹는다. 이미 목록에 있으면 두 번 넣지 않는다.
  const own = viewerEmail?.trim().toLowerCase();
  const ids =
    own && !shared.some((id) => id.toLowerCase() === own)
      ? [...shared, own]
      : shared;

  if (ids.length === 0) {
    return (
      <EmptyState message="캘린더가 아직 연결되지 않았다. GOOGLE_CALENDAR_ID를 설정해라." />
    );
  }

  // 설정 화면에서 엉뚱한 값(삽입 코드·공개 URL)을 복사한 경우를 걸러낸다.
  const wrong = ids.filter((id) => /^https?:|<iframe|\s/.test(id));

  return (
    <div>
      <div className="mb-2 flex justify-end gap-2">
        <a
          href={openCalendarUrl(ids[0])}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          구글 캘린더에서 열기
        </a>
        <a
          href={createEventUrl(ids[0])}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          일정 추가
        </a>
      </div>

      {wrong.length > 0 ? (
        <p className="mb-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          GOOGLE_CALENDAR_ID에 캘린더 ID가 아닌 값이 섞여 있다. 구글 캘린더 설정의
          &quot;캘린더 통합 → 캘린더 ID&quot; 값만, 여러 개면 쉼표로 나열해라.
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <iframe
          src={embedUrl(ids)}
          title="오픈가든 캘린더"
          className="h-[420px] w-full sm:h-[560px]"
          loading="lazy"
        />
      </div>

      <p className="mt-2 text-right text-xs break-all text-neutral-400">
        {ids.join(" · ")}
      </p>
    </div>
  );
}
