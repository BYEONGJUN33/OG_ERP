import Link from "next/link";

import { AppShell, Section } from "@/components/app-shell";
import { TodoAddButton } from "@/components/todo-add-button";
import { TodoBoard } from "@/components/todo-board";
import { WeekCalendar } from "@/components/week-calendar";
import { MEMBERS } from "@/config/users";
import { getCompletedToday, getOpenTodos } from "@/lib/airtable/todos";
import { getEvents } from "@/lib/calendar/events";
import { weekDays, weekRange } from "@/lib/calendar/week";
import { auth } from "@/lib/auth";
import { todayInSeoul } from "@/lib/date";
import { fail, ok } from "@/lib/result";
import type { Todo } from "@/lib/todo-types";

/**
 * 대시보드 — 한 화면에 다 보인다.
 * 탭으로 나누지 않는다. 클릭해야 보이면 한눈에 보는 게 아니다.
 */
export default async function DashboardPage() {
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

  // 보드는 남은 일 + 오늘 끝낸 일을 함께 본다.
  const board = open.ok && done.ok ? ok([...open.data, ...done.data]) : open;

  return (
    <AppShell
      title="대시보드"
      subtitle={today}
      action={
        member ? (
          <TodoAddButton members={Object.values(MEMBERS)} defaultOwner={member} />
        ) : null
      }
    >
      <Section
        title="할 일"
        action={
          <Link href="/todos" className="text-xs text-muted hover:text-ink">
            전체 보기 →
          </Link>
        }
      >
        <TodoBoard result={board} me={member} />
      </Section>

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
