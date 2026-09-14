"use client";

import { useActionState, useRef } from "react";

import { addTodoAction, type ActionState } from "@/app/todo-actions";
import { TODO_CATEGORIES } from "@/lib/todo-types";

const FIELD =
  "rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none";

export function TodoAddForm({
  members,
  defaultOwner,
}: {
  members: string[];
  defaultOwner: string;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const next = await addTodoAction(prev, formData);
      if (!next.error) form.current?.reset();
      return next;
    },
    { error: null },
  );

  return (
    <form
      ref={form}
      action={action}
      className="rounded-lg border border-neutral-200 p-3"
    >
      <div className="flex flex-wrap gap-2">
        <input
          name="title"
          placeholder="할 일을 적어라"
          className={`${FIELD} min-w-0 flex-1`}
          required
        />
        <select name="owner" defaultValue={defaultOwner} className={FIELD}>
          {members.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <input name="due" type="date" className={FIELD} />
        <select name="category" defaultValue="" className={FIELD}>
          <option value="">분류 없음</option>
          {TODO_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {pending ? "추가 중" : "추가"}
        </button>
      </div>

      {state.error ? (
        <p className="mt-2 text-sm text-red-700">{state.error}</p>
      ) : null}
    </form>
  );
}
