import { ErrorState } from "@/components/data-state";
import { EventLink } from "@/components/event-link";
import { minutesOfDay } from "@/lib/calendar/week";
import { eventDate, type PortalEvent } from "@/lib/calendar/types";
import type { Result } from "@/lib/result";

/**
 * 주간 캘린더. 구글 캘린더의 주 보기와 같은 모양 —
 * 왼쪽에 시간 눈금, 칸 안에 일정이 시각과 길이만큼 놓인다.
 *
 * 종일 일정과 할 일 마감은 시간이 없으므로 맨 위 띠에 따로 모은다.
 */

const PX_PER_MIN = 40 / 60; // 한 시간 40px
const DEFAULT_FROM = 8;
const DEFAULT_TO = 20;

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

type Placed = PortalEvent & {
  top: number;
  height: number;
  /** 겹칠 때 나란히 놓으려고 */
  column: number;
  columns: number;
};

/** 겹치는 것끼리 묶어 나란히 놓는다. 서로 가리지 않게. */
function place(events: PortalEvent[], fromMin: number): Placed[] {
  const spans = events
    .map((event) => {
      const start = minutesOfDay(event.start);
      const end = event.end ? minutesOfDay(event.end) : start + 60;
      return { event, start, end: Math.max(end, start + 30) };
    })
    .sort((a, b) => a.start - b.start);

  const placed: Placed[] = [];
  let group: typeof spans = [];

  const flush = () => {
    const columns: number[] = []; // 각 열의 마지막 끝 시각
    const assigned = group.map((span) => {
      let column = columns.findIndex((end) => end <= span.start);
      if (column === -1) column = columns.length;
      columns[column] = span.end;
      return { span, column };
    });

    for (const { span, column } of assigned) {
      placed.push({
        ...span.event,
        top: (span.start - fromMin) * PX_PER_MIN,
        height: (span.end - span.start) * PX_PER_MIN,
        column,
        columns: columns.length,
      });
    }
    group = [];
  };

  let groupEnd = -1;
  for (const span of spans) {
    if (group.length > 0 && span.start >= groupEnd) flush();
    group.push(span);
    groupEnd = Math.max(groupEnd, span.end);
  }
  if (group.length > 0) flush();

  return placed;
}

export function WeekCalendar({
  days,
  today,
  result,
}: {
  days: string[];
  today: string;
  result: Result<PortalEvent[]>;
}) {
  if (!result.ok) return <ErrorState message={result.message} />;

  const timed = result.data.filter((event) => !event.allDay);
  const allDay = result.data.filter((event) => event.allDay);

  // 일정이 눈금 밖에 있으면 눈금을 넓힌다. 안 보이는 일정이 있으면 안 된다.
  const starts = timed.map((event) => Math.floor(minutesOfDay(event.start) / 60));
  const ends = timed.map((event) =>
    Math.ceil(minutesOfDay(event.end ?? event.start) / 60),
  );
  const fromHour = Math.min(DEFAULT_FROM, ...starts);
  const toHour = Math.max(DEFAULT_TO, ...ends);
  const fromMin = fromHour * 60;
  const hours = Array.from({ length: toHour - fromHour }, (_, i) => fromHour + i);
  const bodyHeight = (toHour - fromHour) * 60 * PX_PER_MIN;

  return (
    <div className="card overflow-hidden">
      {/* 날짜 머리 */}
      <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] border-b border-line bg-canvas">
        <div />
        {days.map((day, index) => {
          const isToday = day === today;
          return (
            <div key={day} className="border-l border-line px-2 py-1.5 text-center">
              <div className="text-[11px] text-muted">{WEEKDAYS[index]}</div>
              <div
                className={`mx-auto mt-0.5 w-6 rounded-[3px] text-[13px] ${
                  isToday ? "bg-brand-600 font-bold text-white" : "font-medium"
                }`}
              >
                {Number(day.slice(8, 10))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 종일 · 마감 띠 */}
      <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] border-b border-line">
        <div className="px-1 py-1 text-right text-[10px] text-faint">종일</div>
        {days.map((day) => (
          <div key={day} className="min-h-[26px] border-l border-line p-1">
            <div className="flex flex-col gap-0.5">
              {allDay
                .filter((event) => eventDate(event.start) === day)
                .map((event) => (
                  <span
                    key={event.id}
                    className="truncate rounded-[2px] px-1 py-px text-[11px]"
                    style={tint(event.color)}
                  >
                    <EventLink event={event} className="hover:underline" />
                  </span>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* 시간 격자 */}
      <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))]">
        <div>
          {hours.map((hour) => (
            <div
              key={hour}
              style={{ height: 60 * PX_PER_MIN }}
              className="relative border-t border-line first:border-t-0"
            >
              <span className="absolute -top-1.5 right-1 bg-surface px-0.5 text-[10px] text-faint">
                {String(hour).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>

        {days.map((day) => {
          const placed = place(
            timed.filter((event) => eventDate(event.start) === day),
            fromMin,
          );

          return (
            <div
              key={day}
              className="relative border-l border-line"
              style={{ height: bodyHeight }}
            >
              {hours.map((hour) => (
                <div
                  key={hour}
                  style={{ height: 60 * PX_PER_MIN }}
                  className="border-t border-line first:border-t-0"
                />
              ))}

              {placed.map((event) => (
                <div
                  key={event.id}
                  title={event.title}
                  className="absolute overflow-hidden rounded-[2px] px-1 py-px text-[11px] leading-tight"
                  style={{
                    top: event.top,
                    height: event.height,
                    left: `${(event.column / event.columns) * 100}%`,
                    width: `${(1 / event.columns) * 100}%`,
                    ...tint(event.color),
                  }}
                >
                  <EventLink event={event} className="hover:underline" />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function tint(color: string | undefined): React.CSSProperties {
  if (!color) return { background: "#eceef1", color: "#44546f" };
  return { background: `${color}26`, color, borderLeft: `2px solid ${color}` };
}
