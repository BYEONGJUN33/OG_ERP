import { AppShell } from "@/components/app-shell";
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
    <AppShell title="일정" action={<CalendarLinks />}>
      <MonthCalendar
        year={year}
        month={month}
        weeks={weeks}
        today={today}
        result={events}
      />
    </AppShell>
  );
}
