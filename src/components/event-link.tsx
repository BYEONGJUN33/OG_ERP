import Link from "next/link";

import type { PortalEvent } from "@/lib/calendar/types";

/**
 * 일정 제목. 원본이 우리 화면이면 같은 탭, 구글이면 새 탭.
 * 할 일을 보러 가면서 포털을 떠날 이유가 없다.
 */
export function EventLink({
  event,
  className,
}: {
  event: PortalEvent;
  className?: string;
}) {
  if (!event.href) return <>{event.title}</>;

  if (event.href.startsWith("/")) {
    return (
      <Link href={event.href} title={event.title} className={className}>
        {event.title}
      </Link>
    );
  }

  return (
    <a
      href={event.href}
      target="_blank"
      rel="noreferrer"
      title={event.title}
      className={className}
    >
      {event.title}
    </a>
  );
}
