import { EmptyState, ErrorState } from "@/components/data-state";
import { EventLink } from "@/components/event-link";
import type { PortalEvent } from "@/lib/calendar/types";
import type { Result } from "@/lib/result";

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
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
            style={{ background: event.color ?? "#8993a4" }}
          />
          <span className="min-w-0 flex-1 text-sm">
            <EventLink event={event} className="hover:underline" />
          </span>
          {event.location ? (
            <span className="text-xs text-muted">{event.location}</span>
          ) : null}
          {event.owner ? (
            <span className="text-xs text-muted">{event.owner}</span>
          ) : null}

        </li>
      ))}
    </ul>
  );
}
