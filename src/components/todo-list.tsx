import Link from "next/link";

import { EmptyState, ErrorState } from "@/components/data-state";
import { TodoStatusSelect } from "@/components/todo-status";
import type { Todo } from "@/lib/todo-types";
import { daysUntil, dueLabel, todayInSeoul } from "@/lib/date";
import type { Result } from "@/lib/result";

export function TodoList({
  result,
  emptyMessage = "남은 할 일이 없다.",
  showOwner = false,
  readOnly = false,
}: {
  result: Result<Todo[]>;
  emptyMessage?: string;
  /** 남의 일이 섞인 목록에서는 담당자를 보여준다 */
  showOwner?: boolean;
  readOnly?: boolean;
}) {
  if (!result.ok) return <ErrorState message={result.message} />;
  if (result.data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  const today = todayInSeoul();

  return (
    <ul className="card divide-y divide-line">
      {result.data.map((todo) => {
        const overdue = todo.due !== null && daysUntil(todo.due, today) < 0;

        return (
          <li key={todo.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3">
            {readOnly ? (
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                {todo.status}
              </span>
            ) : (
              <TodoStatusSelect id={todo.id} status={todo.status} />
            )}
            {showOwner ? (
              <span className="text-xs text-muted">{todo.owner}</span>
            ) : null}
            <Link
              href={`/todos/${todo.id}`}
              className="min-w-0 flex-1 text-sm hover:underline"
            >
              {todo.title}
            </Link>
            <span
              className={`text-xs ${overdue ? "font-medium text-red-700" : "text-muted"}`}
            >
              {dueLabel(todo.due, today)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
