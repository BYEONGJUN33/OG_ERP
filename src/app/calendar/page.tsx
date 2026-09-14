import Link from "next/link";

import { MonthCalendar } from "@/components/month-calendar";
import { getEvents } from "@/lib/calendar/events";
import { gridRange, monthGrid, parseMonth } from "@/lib/calendar/month";
import { todayInSeoul } from "@/lib/date";
import { CalendarLinks } from "@/components/calendar-links";

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const { m } = await searchParams;
  const today = todayInSeoul();
  const { year, month } = parseMonth(typeof m === "string" ? m : undefined, today);

  const weeks = monthGrid(year, month);
  const { from, to } = gridRange(weeks);
  const events = await getEvents(from, to);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">
            ← 오늘
          </Link>
          <h1 className="mt-2 text-xl font-semibold">일정</h1>
        </div>
        <CalendarLinks />
      </div>

      <MonthCalendar
        year={year}
        month={month}
        weeks={weeks}
        today={today}
        result={events}
      />
    </main>
  );
}
