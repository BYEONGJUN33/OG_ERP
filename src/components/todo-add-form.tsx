"use client";

import { useActionState, useRef } from "react";

import { addTodoAction, type ActionState } from "@/app/todo-actions";
import { TODO_CATEGORIES } from "@/lib/todo-types";

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
      className="card p-3"
    >
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
        <button
          type="submit"
          disabled={pending}
          className="btn-primary"
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
