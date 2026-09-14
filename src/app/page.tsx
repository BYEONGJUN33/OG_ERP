import Link from "next/link";

import { AppShell, Section } from "@/components/app-shell";
import { EventList } from "@/components/event-list";
import { TodoAddForm } from "@/components/todo-add-form";
import { TodoList } from "@/components/todo-list";
import { MEMBERS } from "@/config/users";
import { getCompletedToday, getOpenTodos } from "@/lib/airtable/todos";
import { getEvents } from "@/lib/calendar/events";
import { auth } from "@/lib/auth";
import { todayInSeoul } from "@/lib/date";
import { fail, ok, type Result } from "@/lib/result";
import type { Todo } from "@/lib/todo-types";

/** 한 목록을 담당자 기준으로 둘로 가른다. 실패는 그대로 물려준다. */
function splitByOwner(
  result: Result<Todo[]>,
  member: string | null,
): { mine: Result<Todo[]>; team: Result<Todo[]> } {
  if (!result.ok) return { mine: result, team: result };
  return {
    mine: ok(result.data.filter((todo) => todo.owner === member)),
    team: ok(result.data.filter((todo) => todo.owner !== member)),
  };
}

export default async function TodayPage() {
  const session = await auth();
  const member = session?.user.member ?? null;

  const today = todayInSeoul();
  const dayStart = new Date(`${today}T00:00:00+09:00`);
  const dayEnd = new Date(`${today}T23:59:59+09:00`);

  const [open, done, events] = await Promise.all([
    member ? getOpenTodos() : Promise.resolve(fail<Todo[]>("로그인 정보를 읽지 못했다")),
    member
      ? getCompletedToday()
      : Promise.resolve(fail<Todo[]>("로그인 정보를 읽지 못했다")),
    getEvents(dayStart, dayEnd),
  ]);

  const { mine, team } = splitByOwner(open, member);

  // 할 일은 위 구획에 이미 있다. 오늘 일정에서 또 보여주지 않는다.
  const schedule = events.ok
    ? ok(events.data.filter((event) => event.source === "google"))
    : events;

  return (
    <AppShell title="오늘" subtitle={today}>
      <Section title="내 할 일">
        {member ? (
          <div className="mb-3">
            <TodoAddForm members={Object.values(MEMBERS)} defaultOwner={member} />
          </div>
        ) : null}
        <TodoList result={mine} emptyMessage="내가 맡은 남은 일이 없다." />
      </Section>

      <Section
        title="팀 할 일"
        action={
          <Link href="/todos" className="text-xs text-muted hover:text-ink">
            전체 보기 →
          </Link>
        }
      >
        <TodoList
          result={team}
          showOwner
          emptyMessage="다른 사람이 맡은 남은 일이 없다."
        />
      </Section>

      <Section title="오늘 끝낸 일">
        <TodoList
          result={done}
          showOwner
          readOnly
          emptyMessage="오늘 끝낸 일이 아직 없다."
        />
      </Section>

      <Section
        title="오늘 일정"
        action={
          <Link href="/calendar" className="text-xs text-muted hover:text-ink">
            달력 보기 →
          </Link>
        }
      >
        <EventList result={schedule} emptyMessage="오늘 잡힌 일정이 없다." />
      </Section>
    </AppShell>
  );
}
