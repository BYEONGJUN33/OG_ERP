import { AppShell, Section } from "@/components/app-shell";
import { Tabs } from "@/components/tabs";
import { TodoAddButton } from "@/components/todo-add-button";
import { TodoBoard } from "@/components/todo-board";
import { TodoList } from "@/components/todo-list";
import { TodoTimeline } from "@/components/todo-timeline";
import { MEMBERS } from "@/config/users";
import { getCompletedToday, getOpenTodos } from "@/lib/airtable/todos";
import { monthGrid } from "@/lib/calendar/month";
import { auth } from "@/lib/auth";
import { todayInSeoul } from "@/lib/date";
import { fail, ok } from "@/lib/result";
import type { Todo } from "@/lib/todo-types";

const VIEWS = ["보드", "목록", "타임라인"] as const;
type View = (typeof VIEWS)[number];

/** 담당자별로 묶는다. 섞어놓고 이름표만 붙이지 않는다. */
function groupByOwner(todos: Todo[], members: string[]): [string, Todo[]][] {
  return members
    .map((member): [string, Todo[]] => [
      member,
      todos.filter((todo) => todo.owner === member),
    ])
    .concat([["담당자 없음", todos.filter((todo) => !members.includes(todo.owner))]])
    .filter(([, list]) => list.length > 0);
}

export default async function TodosPage({ searchParams }: PageProps<"/todos">) {
  const { view } = await searchParams;
  const active: View = (VIEWS as readonly string[]).includes(String(view))
    ? (view as View)
    : "보드";

  const session = await auth();
  const member = session?.user.member ?? null;
  const members = Object.values(MEMBERS) as string[];
  const today = todayInSeoul();

  const [open, done] = await Promise.all([
    member ? getOpenTodos() : Promise.resolve(fail<Todo[]>("로그인 정보를 읽지 못했다")),
    member
      ? getCompletedToday()
      : Promise.resolve(fail<Todo[]>("로그인 정보를 읽지 못했다")),
  ]);

  // 보드와 타임라인은 끝난 일도 함께 본다. 목록은 남은 일만.
  const all = open.ok && done.ok ? ok([...open.data, ...done.data]) : open;

  // 타임라인이 그릴 기간 — 이번 달 격자와 같은 범위
  const [year, month] = today.split("-").map(Number);
  const days = monthGrid(year, month).flat();

  return (
    <AppShell
      title="할 일"
      subtitle={open.ok ? `끝나지 않은 일 ${open.data.length}건` : undefined}
      action={
        member ? (
          <TodoAddButton members={members} defaultOwner={member} />
        ) : null
      }
    >
      <Tabs
        active={active}
        items={VIEWS.map((name) => ({
          href: name === "보드" ? "/todos" : `/todos?view=${name}`,
          label: name,
        }))}
      />

      {active === "목록" ? (
        <>
          {!open.ok || open.data.length === 0 ? (
            <TodoList result={open} emptyMessage="남은 일이 없다." />
          ) : (
            groupByOwner(open.data, members).map(([owner, todos]) => (
              <Section key={owner} title={owner}>
                <TodoList result={ok(todos)} />
              </Section>
            ))
          )}

          <Section title="오늘 끝낸 일">
            <TodoList
              result={done}
              showOwner
              readOnly
              emptyMessage="오늘 끝낸 일이 아직 없다."
            />
          </Section>
        </>
      ) : null}

      {active === "보드" ? <TodoBoard result={all} me={member} /> : null}

      {active === "타임라인" ? (
        <TodoTimeline result={all} days={days} today={today} />
      ) : null}
    </AppShell>
  );
}
