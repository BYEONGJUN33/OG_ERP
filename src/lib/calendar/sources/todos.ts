import "server-only";

import { getTodosWithDueDate } from "@/lib/airtable/todos";
import type { PortalEvent } from "@/lib/calendar/types";

/**
 * 할 일 마감을 일정으로 바꾼다.
 *
 * 구글로 밀어넣지 않는다. 읽을 때 합칠 뿐이다. (원칙 9)
 * 마감일이 곧 달력 위의 날짜다 — 시작일이 있어도 사람이 신경 쓰는 건 마감이다.
 */
export async function getTodoEvents(
  from: Date,
  to: Date,
): Promise<PortalEvent[]> {
  const result = await getTodosWithDueDate();
  if (!result.ok) throw new Error(result.message);

  const start = from.toISOString().slice(0, 10);
  const end = to.toISOString().slice(0, 10);

  return result.data
    .filter((todo) => todo.due !== null && todo.due >= start && todo.due <= end)
    .map((todo) => ({
      id: `todo:${todo.id}`,
      title: todo.status === "완료" ? `✓ ${todo.title}` : todo.title,
      start: todo.due as string,
      allDay: true,
      source: "airtable" as const,
      type: "할일" as const,
      owner: todo.owner,
      description: todo.memo,
      href: `/todos/${todo.id}`,
    }));
}
