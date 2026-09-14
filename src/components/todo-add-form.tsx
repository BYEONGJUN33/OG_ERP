"use client";

import { useActionState, useRef } from "react";

import { addTodoAction, type ActionState } from "@/app/todo-actions";
import { TODO_CATEGORIES } from "@/lib/todo-types";

export function TodoAddForm({
  members,
  defaultOwner,
  /** 창 안에서는 세로로 쌓는다. 한 줄에 밀어 넣으면 칸이 좁아 못 읽는다. */
  stacked = false,
  onDone,
}: {
  members: string[];
  defaultOwner: string;
  stacked?: boolean;
  onDone?: () => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const next = await addTodoAction(prev, formData);
      if (!next.error) {
        form.current?.reset();
        onDone?.();
      }
      return next;
    },
    { error: null },
  );

  if (stacked) {
    return (
      <form ref={form} action={action} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-muted">내용</span>
          <input name="title" placeholder="할 일을 적어라" className="field" required />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted">담당자</span>
            <select name="owner" defaultValue={defaultOwner} className="field">
              {members.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted">분류</span>
            <select name="category" defaultValue="" className="field">
              <option value="">분류 없음</option>
              {TODO_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted">시작일</span>
            <input name="start" type="date" className="field" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted">마감일</span>
            <input name="due" type="date" className="field" />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3">
          {state.error ? (
            <span className="mr-auto text-sm text-danger">{state.error}</span>
          ) : null}
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "추가 중" : "추가"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form ref={form} action={action} className="card p-3">
      <div className="flex flex-wrap gap-2">
        <input
          name="title"
          placeholder="할 일을 적어라"
          className="field min-w-0 flex-1"
          required
        />
        <select name="owner" defaultValue={defaultOwner} className="field">
          {members.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <input name="due" type="date" className="field" />
        <select name="category" defaultValue="" className="field">
          <option value="">분류 없음</option>
          {TODO_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "추가 중" : "추가"}
        </button>
      </div>

      {state.error ? (
        <p className="mt-2 text-sm text-danger">{state.error}</p>
      ) : null}
    </form>
  );
}
