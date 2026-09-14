import Link from "next/link";

import { EventList } from "@/components/event-list";
import { ProgramCards } from "@/components/program-cards";
import { TodoAddForm } from "@/components/todo-add-form";
import { TodoList } from "@/components/todo-list";
import { MEMBERS } from "@/config/users";
import { getPrograms } from "@/lib/airtable/programs";
import { getEvents } from "@/lib/calendar/events";
import { getCompletedToday, getOpenTodos } from "@/lib/airtable/todos";
import { auth, signOut } from "@/lib/auth";
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

export default async function Home() {
  const session = await auth();
  const member = session?.user.member ?? null;

  // 오늘 하루만 본다. 전체 달력은 /calendar 에 있다.
  const today = todayInSeoul();
  const dayStart = new Date(`${today}T00:00:00+09:00`);
  const dayEnd = new Date(`${today}T23:59:59+09:00`);

  const [programs, open, done, events] = await Promise.all([
    getPrograms(),
    member ? getOpenTodos() : Promise.resolve(fail<Todo[]>("로그인 정보를 읽지 못했다")),
    member
      ? getCompletedToday()
      : Promise.resolve(fail<Todo[]>("로그인 정보를 읽지 못했다")),
    getEvents(dayStart, dayEnd),
  ]);

  // 할 일은 위 구획에 이미 있다. 오늘 일정에서 또 보여주지 않는다.
  const schedule = events.ok
    ? ok(events.data.filter((event) => event.source === "google"))
    : events;

  const { mine, team } = splitByOwner(open, member);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">오늘</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {today}
            {member ? ` · ${member}님` : ""}
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
          >
            로그아웃
          </button>
        </form>
      </header>

      <Section title="내 할 일">
        {member ? (
          <div className="mb-3">
            <TodoAddForm members={Object.values(MEMBERS)} defaultOwner={member} />
          </div>
        ) : null}
        <TodoList result={mine} emptyMessage="내가 맡은 남은 일이 없다." />
      </Section>

      <Section title="팀 할 일">
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

      <Section title="프로그램">
        <ProgramCards result={programs} />
      </Section>

      <Section
        title="오늘 일정"
        action={
          <Link href="/calendar" className="text-xs text-neutral-500 hover:text-neutral-900">
            달력 보기 →
          </Link>
        }
      >
        <EventList result={schedule} emptyMessage="오늘 잡힌 일정이 없다." />
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
