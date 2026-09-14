import Link from "next/link";

import { EmptyState, ErrorState } from "@/components/data-state";
import { TodoStatusSelect } from "@/components/todo-status";
import { daysUntil, dueLabel, todayInSeoul } from "@/lib/date";
import { categoryChip, statusChip } from "@/lib/labels";
import type { Result } from "@/lib/result";
import type { Todo } from "@/lib/todo-types";

/**
 * 가로로 긴 카드 한 줄이 할 일 하나다.
 * 왼쪽부터 상태 · 제목 · 분류 · 담당자 · 마감.
 */
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
  if (result.data.length === 0) return <EmptyState message={emptyMessage} />;

  const today = todayInSeoul();

  return (
    <ul className="flex flex-col gap-1.5">
      {result.data.map((todo) => {
        const overdue = todo.due !== null && daysUntil(todo.due, today) < 0;
        const dueToday = todo.due === today;

        return (
          <li
            key={todo.id}
            className="card flex flex-wrap items-center gap-x-2.5 gap-y-1 px-3 py-2.5"
          >
            {readOnly ? (
              <span className={`chip ${statusChip(todo.status)}`}>{todo.status}</span>
            ) : (
              <TodoStatusSelect id={todo.id} status={todo.status} />
            )}

            <Link
              href={`/todos/${todo.id}`}
              className="min-w-0 flex-1 truncate text-sm hover:underline"
            >
              {todo.title}
            </Link>

            {todo.category ? (
              <span className={`chip ${categoryChip(todo.category)}`}>
                {todo.category}
              </span>
            ) : null}

            {showOwner && todo.owner ? (
              <Avatar name={todo.owner} />
            ) : null}

            <span
              className={`w-[68px] text-right text-xs ${
                overdue
                  ? "font-semibold text-danger"
                  : dueToday
                    ? "font-semibold text-ink"
                    : todo.due
                      ? "text-muted"
                      : "text-faint"
              }`}
            >
              {dueLabel(todo.due, today)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function Avatar({ name }: { name: string }) {
  return (
    <span
      title={name}
      className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-faint text-[11px] font-semibold text-white"
    >
      {name.slice(0, 1)}
    </span>
  );
}
