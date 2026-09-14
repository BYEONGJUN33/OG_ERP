"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { setStatusAction } from "@/app/todo-actions";
import { TODO_STATUSES, type TodoStatus } from "@/lib/todo-types";

const STYLE: Record<TodoStatus, string> = {
  예정: "bg-neutral-100 text-neutral-700",
  진행중: "bg-amber-100 text-amber-800",
  완료: "bg-emerald-100 text-emerald-800",
  보류: "bg-red-100 text-red-800",
};

export function TodoStatusSelect({
  id,
  status,
}: {
  id: string;
  status: TodoStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // 서버 응답을 기다리지 않고 먼저 바꿔 보여준다. 실패하면 되돌린다.
  const [shown, setShown] = useState<TodoStatus>(status);
  const [error, setError] = useState<string | null>(null);

  function change(next: TodoStatus) {
    const previous = shown;
    setShown(next);
    setError(null);

    startTransition(async () => {
      const result = await setStatusAction(id, next);
      if (result.error) {
        setShown(previous);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <span className="inline-flex items-center gap-1">
      <select
        value={shown}
        disabled={pending}
        onChange={(event) => change(event.target.value as TodoStatus)}
        aria-label="상태"
        className={`rounded px-2 py-0.5 text-xs ${STYLE[shown]} disabled:opacity-60`}
      >
        {TODO_STATUSES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      {error ? <span title={error} className="text-xs text-red-700">!</span> : null}
    </span>
  );
}
