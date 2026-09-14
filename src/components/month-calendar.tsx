import Link from "next/link";

import { ErrorState } from "@/components/data-state";
import { EventLink } from "@/components/event-link";
import { eventTime } from "@/components/event-list";
import { shiftMonth, WEEKDAYS } from "@/lib/calendar/month";
import { eventDate, type PortalEvent } from "@/lib/calendar/types";
import type { Result } from "@/lib/result";

/**
 * 일정 색을 옅은 배경 + 진한 글씨로 바꾼다.
 * 구글에서 지정한 색을 그대로 쓰되, 글자가 읽히도록 배경만 흐리게 깐다.
 */
function tint(color: string | undefined): React.CSSProperties {
  if (!color) return { background: "#eceef1", color: "#44546f" };
  return { background: `${color}22`, color };
}

/**
 * 월간 달력. 구글이 그려주던 자리를 대신한다.
 * 라이브러리를 쓰지 않는다 — 우리가 필요한 건 격자에 점을 찍는 것뿐이고,
 * 반복 일정 전개 같은 어려운 부분은 구글이 이미 끝내서 보내준다.
 */
export function MonthCalendar({
  year,
  month,
  weeks,
  today,
  result,
  compact = false,
}: {
  year: number;
  month: number;
  weeks: string[][];
  today: string;
  result: Result<PortalEvent[]>;
  /** 대시보드에 얹을 때. 이동 버튼을 숨기고 칸을 낮춘다. */
  compact?: boolean;
}) {
  if (!result.ok) return <ErrorState message={result.message} />;

  // 날짜별로 모아둔다. 여러 날에 걸친 일정은 시작일에만 표시한다.
  const byDay = new Map<string, PortalEvent[]>();
  for (const event of result.data) {
    const day = eventDate(event.start);
    const list = byDay.get(day);
    if (list) list.push(event);
    else byDay.set(day, [event]);
  }

  const label = `${year}년 ${month}월`;

  return (
    <div>
      <div className={`mb-3 flex items-center gap-2 ${compact ? "hidden" : ""}`}>
        <Link
          href={`/calendar?m=${shiftMonth(year, month, -1)}`}
          aria-label="이전 달"
          className="btn px-2 py-1"
        >
          ‹
        </Link>
        <Link
          href={`/calendar?m=${shiftMonth(year, month, 1)}`}
          aria-label="다음 달"
          className="btn px-2 py-1"
        >
          ›
        </Link>
        <span className="ml-1 font-medium">{label}</span>
        <Link
          href="/calendar"
          className="btn ml-auto py-1"
        >
          오늘
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed border-collapse">
          <thead>
            <tr>
              {WEEKDAYS.map((day) => (
                <th
                  key={day}
                  className="border border-line bg-canvas px-2 py-1 text-xs font-medium text-muted"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0]}>
                {week.map((day) => {
                  const events = byDay.get(day) ?? [];
                  const inMonth = Number(day.slice(5, 7)) === month;
                  const isToday = day === today;

                  return (
                    <td
                      key={day}
                      className={`${compact ? "h-16" : "h-24"} border border-line align-top ${
                        inMonth ? "bg-surface" : "bg-canvas"
                      }`}
                    >
                      <div className="px-1.5 py-1">
                        <span
                          className={`inline-block rounded px-1 text-xs ${
                            isToday
                              ? "bg-brand-600 font-medium text-white"
                              : inMonth
                                ? "text-ink"
                                : "text-faint"
                          }`}
                        >
                          {Number(day.slice(8, 10))}
                        </span>

                        <ul className="mt-1 space-y-0.5">
                          {events.slice(0, 3).map((event) => (
                            <li
                              key={event.id}
                              className="truncate rounded-[2px] px-1 py-px text-[11px]"
                              style={tint(event.color)}
                            >
                              {event.allDay ? null : (
                                <span className="opacity-70">{eventTime(event)} </span>
                              )}
                              <EventLink event={event} className="hover:underline" />
                            </li>
                          ))}
                          {events.length > 3 ? (
                            <li className="px-1 text-[11px] text-faint">
                              +{events.length - 3}
                            </li>
                          ) : null}
                        </ul>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
