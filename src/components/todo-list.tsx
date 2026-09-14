import { EmptyState, ErrorState } from "@/components/data-state";
import { TodoStatusSelect } from "@/components/todo-status";
import type { Todo } from "@/lib/todo-types";
import { daysUntil, dueLabel, todayInSeoul } from "@/lib/date";
import type { Result } from "@/lib/result";

export function TodoList({
  result,
  emptyMessage = "남은 할 일이 없다.",
}: {
  result: Result<Todo[]>;
  emptyMessage?: string;
}) {
  if (!result.ok) return <ErrorState message={result.message} />;
  if (result.data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  const today = todayInSeoul();

  return (
    <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
      {result.data.map((todo) => {
        const overdue = todo.due !== null && daysUntil(todo.due, today) < 0;

        return (
          <li key={todo.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3">
            <TodoStatusSelect id={todo.id} status={todo.status} />
            <span className="min-w-0 flex-1 text-sm">{todo.title}</span>
            <span
              className={`text-xs ${overdue ? "font-medium text-red-700" : "text-neutral-500"}`}
            >
              {dueLabel(todo.due, today)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
