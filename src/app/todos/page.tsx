import { AppShell, Section } from "@/components/app-shell";
import { TodoAddForm } from "@/components/todo-add-form";
import { TodoList } from "@/components/todo-list";
import { MEMBERS } from "@/config/users";
import { getCompletedToday, getOpenTodos } from "@/lib/airtable/todos";
import { auth } from "@/lib/auth";
import { fail, ok } from "@/lib/result";
import type { Todo } from "@/lib/todo-types";

/** 담당자별로 묶는다. 섞어놓고 이름표만 붙이지 않는다. */
function groupByOwner(todos: Todo[], members: string[]): [string, Todo[]][] {
  return members
    .map((member): [string, Todo[]] => [
      member,
      todos.filter((todo) => todo.owner === member),
    ])
    .concat([
      ["담당자 없음", todos.filter((todo) => !members.includes(todo.owner))],
    ])
    .filter(([, list]) => list.length > 0);
}

export default async function TodosPage() {
  const session = await auth();
  const member = session?.user.member ?? null;
  const members = Object.values(MEMBERS) as string[];

  const [open, done] = await Promise.all([
    member ? getOpenTodos() : Promise.resolve(fail<Todo[]>("로그인 정보를 읽지 못했다")),
    member
      ? getCompletedToday()
      : Promise.resolve(fail<Todo[]>("로그인 정보를 읽지 못했다")),
  ]);

  return (
    <AppShell title="할 일" subtitle="끝나지 않은 일 전부">
      {member ? (
        <div className="mb-6">
          <TodoAddForm members={members} defaultOwner={member} />
        </div>
      ) : null}

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
    </AppShell>
  );
}
