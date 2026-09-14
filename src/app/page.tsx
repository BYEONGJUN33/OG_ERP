import Link from "next/link";

import { AppShell, Section } from "@/components/app-shell";
import { Tabs } from "@/components/tabs";
import { TodoAddForm } from "@/components/todo-add-form";
import { TodoList } from "@/components/todo-list";
import { WeekCalendar } from "@/components/week-calendar";
import { MEMBERS } from "@/config/users";
import { getCompletedToday, getOpenTodos } from "@/lib/airtable/todos";
import { getEvents } from "@/lib/calendar/events";
import { weekDays, weekRange } from "@/lib/calendar/week";
import { auth } from "@/lib/auth";
import { todayInSeoul } from "@/lib/date";
import { fail, ok, type Result } from "@/lib/result";
import type { Todo } from "@/lib/todo-types";

const TABS = ["내 할 일", "팀 할 일", "오늘 끝낸 일"] as const;
type Tab = (typeof TABS)[number];

export default async function DashboardPage({ searchParams }: PageProps<"/">) {
  const { tab } = await searchParams;
  const active: Tab = (TABS as readonly string[]).includes(String(tab))
    ? (tab as Tab)
    : "내 할 일";

  const session = await auth();
  const member = session?.user.member ?? null;
  const today = todayInSeoul();

  const days = weekDays(today);
  const span = weekRange(days);

  const [open, done, events] = await Promise.all([
    member ? getOpenTodos() : Promise.resolve(fail<Todo[]>("로그인 정보를 읽지 못했다")),
    member
      ? getCompletedToday()
      : Promise.resolve(fail<Todo[]>("로그인 정보를 읽지 못했다")),
    getEvents(span.from, span.to),
  ]);

  const mine: Result<Todo[]> = open.ok
    ? ok(open.data.filter((todo) => todo.owner === member))
    : open;
  const team: Result<Todo[]> = open.ok
    ? ok(open.data.filter((todo) => todo.owner !== member))
    : open;

  const counts = {
    "내 할 일": mine.ok ? mine.data.length : undefined,
    "팀 할 일": team.ok ? team.data.length : undefined,
    "오늘 끝낸 일": done.ok ? done.data.length : undefined,
  };

  return (
    <AppShell title="대시보드" subtitle={today}>
      <Tabs
        active={active}
        items={TABS.map((name) => ({
          href: name === "내 할 일" ? "/" : `/?tab=${name}`,
          label: name,
          count: counts[name],
        }))}
      />

      {active === "내 할 일" ? (
        <>
          {member ? (
            <div className="mb-3">
              <TodoAddForm members={Object.values(MEMBERS)} defaultOwner={member} />
            </div>
          ) : null}
          <TodoList result={mine} emptyMessage="내가 맡은 남은 일이 없다." />
        </>
      ) : null}

      {active === "팀 할 일" ? (
        <TodoList
          result={team}
          showOwner
          emptyMessage="다른 사람이 맡은 남은 일이 없다."
        />
      ) : null}

      {active === "오늘 끝낸 일" ? (
        <TodoList
          result={done}
          showOwner
          readOnly
          emptyMessage="오늘 끝낸 일이 아직 없다."
        />
      ) : null}

      <Section
        title="이번 주"
        action={
          <Link href="/calendar" className="text-xs text-muted hover:text-ink">
            달력 보기 →
          </Link>
        }
      >
        <WeekCalendar days={days} today={today} result={events} />
      </Section>
    </AppShell>
  );
}
