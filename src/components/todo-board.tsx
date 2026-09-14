import Link from "next/link";

import { ErrorState } from "@/components/data-state";
import { Avatar } from "@/components/todo-list";
import { TodoStatusSelect } from "@/components/todo-status";
import { daysUntil, dueLabel, todayInSeoul } from "@/lib/date";
import { categoryChip } from "@/lib/labels";
import type { Result } from "@/lib/result";
import type { Todo, TodoStatus } from "@/lib/todo-types";

/**
 * 보드. 칸은 셋뿐이다 — 할 일 / 진행중 / 완료.
 * `보류`는 칸을 따로 두지 않고 '할 일' 칸에 섞되 상태 칩으로 구분한다.
 * 2인 조직에서 칸이 늘수록 좌우로 눈이 흩어진다.
 *
 * 카드를 끌어 옮기는 건 아직 없다. 카드 위 상태 칩으로 바꾼다.
 */
const COLUMNS: { title: string; match: TodoStatus[] }[] = [
  { title: "할 일", match: ["할 일", "보류"] },
  { title: "진행중", match: ["진행중"] },
  { title: "완료", match: ["완료"] },
];

export function TodoBoard({
  result,
  me = null,
}: {
  result: Result<Todo[]>;
  /** 내 일을 먼저 올린다. 남의 일보다 내 일이 먼저 눈에 들어와야 한다. */
  me?: string | null;
}) {
  if (!result.ok) return <ErrorState message={result.message} />;

  const today = todayInSeoul();

  return (
    <div className="grid items-start gap-3 sm:grid-cols-3">
      {COLUMNS.map((column) => {
        const todos = result.data
          .filter((todo) => (column.match as string[]).includes(todo.status))
          .sort((a, b) => {
            // 내 일이 위로, 그다음 마감 임박순, 기한 없는 건 맨 뒤로.
            const mineFirst = Number(b.owner === me) - Number(a.owner === me);
            if (mineFirst !== 0) return mineFirst;
            if (a.due && b.due) return a.due.localeCompare(b.due);
            if (a.due) return -1;
            if (b.due) return 1;
            return 0;
          });

        return (
          <div key={column.title} className="rounded-[3px] bg-canvas p-2.5">
            <div className="mb-2.5 flex items-center gap-2 px-0.5">
              <span className="text-[11px] font-bold tracking-[0.06em] text-muted">
                {column.title}
              </span>
              <span className="rounded-full bg-[#e4e6ea] px-1.5 text-[11px] text-muted">
                {todos.length}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {todos.map((todo) => {
                const overdue =
                  todo.due !== null &&
                  todo.status !== "완료" &&
                  daysUntil(todo.due, today) < 0;

                return (
                  <div
                    key={todo.id}
                    className="card px-3 py-2.5 shadow-[0_1px_1px_rgba(9,30,66,0.08)]"
                  >
                    <Link
                      href={`/todos/${todo.id}`}
                      className={`block text-sm leading-snug hover:underline ${
                        todo.status === "완료" ? "text-faint line-through" : ""
                      }`}
                    >
                      {todo.title}
                    </Link>

                    <div className="mt-2 flex items-center gap-1.5">
                      <TodoStatusSelect id={todo.id} status={todo.status} />
                      {todo.category ? (
                        <span className={`chip ${categoryChip(todo.category)}`}>
                          {todo.category}
                        </span>
                      ) : null}
                      <span className="flex-1" />
                      <span
                        className={`text-[11px] ${
                          overdue ? "font-semibold text-danger" : "text-muted"
                        }`}
                      >
                        {todo.due ? dueLabel(todo.due, today) : ""}
                      </span>
                      {todo.owner ? <Avatar name={todo.owner} /> : null}
                    </div>
                  </div>
                );
              })}

              {todos.length === 0 ? (
                <p className="px-0.5 py-1 text-xs text-faint">없다</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
