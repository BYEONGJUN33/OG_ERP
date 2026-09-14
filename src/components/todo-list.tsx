import { EmptyState, ErrorState } from "@/components/data-state";
import type { Todo } from "@/lib/airtable/todos";
import { daysUntil, dueLabel, todayInSeoul } from "@/lib/date";
import type { Result } from "@/lib/result";

const STATUS_STYLE: Record<string, string> = {
  예정: "bg-neutral-100 text-neutral-700",
  진행중: "bg-amber-100 text-amber-800",
  보류: "bg-red-100 text-red-800",
  완료: "bg-emerald-100 text-emerald-800",
};

export function TodoList({ result }: { result: Result<Todo[]> }) {
  if (!result.ok) return <ErrorState message={result.message} />;
  if (result.data.length === 0) {
    return <EmptyState message="남은 할 일이 없다." />;
  }

  const today = todayInSeoul();

  return (
    <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
      {result.data.map((todo) => {
        const overdue = todo.due !== null && daysUntil(todo.due, today) < 0;

        return (
          <li key={todo.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3">
            <span
              className={`rounded px-2 py-0.5 text-xs ${
                STATUS_STYLE[todo.status] ?? STATUS_STYLE.예정
              }`}
            >
              {todo.status}
            </span>
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
