import Link from "next/link";

import { ErrorState } from "@/components/data-state";
import { EventLink } from "@/components/event-link";
import { eventTime } from "@/components/event-list";
import { shiftMonth, WEEKDAYS } from "@/lib/calendar/month";
import { eventDate, type PortalEvent } from "@/lib/calendar/types";
import type { Result } from "@/lib/result";

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
}: {
  year: number;
  month: number;
  weeks: string[][];
  today: string;
  result: Result<PortalEvent[]>;
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
      <div className="mb-3 flex items-center gap-2">
        <Link
          href={`/calendar?m=${shiftMonth(year, month, -1)}`}
          aria-label="이전 달"
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-50"
        >
          ‹
        </Link>
        <Link
          href={`/calendar?m=${shiftMonth(year, month, 1)}`}
          aria-label="다음 달"
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm hover:bg-neutral-50"
        >
          ›
        </Link>
        <span className="ml-1 font-medium">{label}</span>
        <Link
          href="/calendar"
          className="ml-auto rounded-md border border-neutral-300 px-3 py-1 text-sm hover:bg-neutral-50"
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
                  className="border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-500"
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
                      className={`h-24 border border-neutral-200 align-top ${
                        inMonth ? "" : "bg-neutral-50"
                      }`}
                    >
                      <div className="px-1.5 py-1">
                        <span
                          className={`inline-block rounded px-1 text-xs ${
                            isToday
                              ? "bg-neutral-900 font-medium text-white"
                              : inMonth
                                ? "text-neutral-700"
                                : "text-neutral-400"
                          }`}
                        >
                          {Number(day.slice(8, 10))}
                        </span>

                        <ul className="mt-1 space-y-0.5">
                          {events.slice(0, 3).map((event) => (
                            <li key={event.id} className="truncate text-xs">
                              <span className="text-neutral-400">
                                {event.allDay ? "" : `${eventTime(event)} `}
                              </span>
                              <EventLink event={event} className="hover:underline" />
                            </li>
                          ))}
                          {events.length > 3 ? (
                            <li className="text-xs text-neutral-400">
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
