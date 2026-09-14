import Link from "next/link";

import { ErrorState } from "@/components/data-state";
import { categoryHex } from "@/lib/labels";
import type { Result } from "@/lib/result";
import type { Todo } from "@/lib/todo-types";

/**
 * 타임라인. 시작일부터 마감일까지를 막대로 그린다.
 *
 * 둘 중 하나라도 없으면 그릴 길이가 없다. 그런 할 일은 버리지 않고
 * 아래에 따로 모아 "날짜를 채우면 여기 그려진다"를 보이게 한다.
 */
const DAY_PX = 34;
const ROW_PX = 36;
/** 건수가 적어도 이만큼은 자리를 잡는다. 한 건일 때 납작해 보이지 않게. */
const MIN_ROWS = 6;

function daysBetween(a: string, b: string): number {
  return Math.round(
    (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000,
  );
}

export function TodoTimeline({
  result,
  days,
  today,
}: {
  result: Result<Todo[]>;
  /** 그릴 기간(YYYY-MM-DD 목록) */
  days: string[];
  today: string;
}) {
  if (!result.ok) return <ErrorState message={result.message} />;

  const first = days[0];
  const last = days[days.length - 1];

  const drawn = result.data.filter(
    (todo) => todo.start && todo.due && todo.due >= first && todo.start <= last,
  );
  const undated = result.data.filter((todo) => !todo.start || !todo.due);

  return (
    <div>
      <div className="card overflow-x-auto">
        <div style={{ minWidth: 300 + days.length * DAY_PX }}>
          {/* 날짜 머리 */}
          <div className="flex border-b border-line bg-canvas">
            <div className="w-[300px] shrink-0 border-r border-line px-3 py-1.5 text-[11px] font-bold tracking-[0.04em] text-muted">
              할 일
            </div>
            <div className="flex">
              {days.map((day) => (
                <div
                  key={day}
                  style={{ width: DAY_PX }}
                  className={`shrink-0 border-l border-line py-1.5 text-center text-[10px] ${
                    day === today ? "font-bold text-brand-600" : "text-muted"
                  }`}
                >
                  {Number(day.slice(8, 10))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ minHeight: MIN_ROWS * ROW_PX }}>
          {drawn.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              시작일과 마감일이 모두 있는 할 일이 없다.
            </p>
          ) : (
            drawn.map((todo) => {
              const start = todo.start as string;
              const due = todo.due as string;
              const offset = Math.max(0, daysBetween(first, start));
              const endOffset = Math.min(days.length - 1, daysBetween(first, due));
              const span = Math.max(1, endOffset - offset + 1);
              const color = categoryHex(todo.category);

              return (
                <div key={todo.id} className="flex border-b border-line last:border-b-0">
                  <div className="w-[300px] shrink-0 truncate border-r border-line px-3 py-2 text-[13px]">
                    <Link href={`/todos/${todo.id}`} className="hover:underline">
                      {todo.title}
                    </Link>
                  </div>

                  <div className="relative flex-1" style={{ height: ROW_PX }}>
                    <div
                      className="absolute top-0 bottom-0 w-px bg-brand-600"
                      style={{ left: daysBetween(first, today) * DAY_PX }}
                    />
                    <div
                      title={`${start} ~ ${due}`}
                      className="absolute top-1.5 h-6 truncate rounded-[3px] px-2 text-[11px] leading-6 text-white"
                      style={{
                        left: offset * DAY_PX,
                        width: span * DAY_PX - 4,
                        background: color,
                      }}
                    >
                      {todo.title}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>

      {undated.length > 0 ? (
        <section className="mt-5">
          <h3 className="section-title mb-2.5">날짜가 없는 할 일</h3>
          <ul className="flex flex-col gap-1.5">
            {undated.map((todo) => (
              <li key={todo.id} className="card flex items-center gap-2.5 px-3 py-2">
                <Link
                  href={`/todos/${todo.id}`}
                  className="min-w-0 flex-1 truncate text-sm hover:underline"
                >
                  {todo.title}
                </Link>
                <span className="text-xs text-faint">
                  {todo.start ? "마감일 없음" : todo.due ? "시작일 없음" : "둘 다 없음"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
