import { EmptyState, ErrorState } from "@/components/data-state";
import { EventLink } from "@/components/event-link";
import type { PortalEvent } from "@/lib/calendar/types";
import type { Result } from "@/lib/result";

const TYPE_STYLE: Record<string, string> = {
  구글일정: "bg-sky-100 text-sky-800",
  할일: "bg-neutral-100 text-neutral-700",
};

/** 시간 일정은 HH:mm, 종일 일정은 "종일" */
export function eventTime(event: PortalEvent): string {
  if (event.allDay) return "종일";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(event.start));
}

export function EventList({
  result,
  emptyMessage = "일정이 없다.",
}: {
  result: Result<PortalEvent[]>;
  emptyMessage?: string;
}) {
  if (!result.ok) return <ErrorState message={result.message} />;
  if (result.data.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <ul className="card divide-y divide-line">
      {result.data.map((event) => (
        <li key={event.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3">
          <span className="w-12 shrink-0 text-xs text-muted">
            {eventTime(event)}
          </span>
          <span className="min-w-0 flex-1 text-sm">
            <EventLink event={event} className="hover:underline" />
          </span>
          {event.location ? (
            <span className="text-xs text-muted">{event.location}</span>
          ) : null}
          {event.owner ? (
            <span className="text-xs text-muted">{event.owner}</span>
          ) : null}
          <span
            className={`rounded px-2 py-0.5 text-xs ${
              TYPE_STYLE[event.type] ?? TYPE_STYLE.할일
            }`}
          >
            {event.type}
          </span>
        </li>
      ))}
    </ul>
  );
}
