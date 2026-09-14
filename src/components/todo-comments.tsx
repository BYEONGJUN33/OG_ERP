"use client";

import { useActionState, useRef } from "react";

import { addCommentAction, type ActionState } from "@/app/todo-actions";
import { parseComments } from "@/lib/comments";

export function TodoComments({ id, raw }: { id: string; raw: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    async (prev, formData) => {
      const next = await addCommentAction(id, prev, formData);
      if (!next.error) form.current?.reset();
      return next;
    },
    { error: null },
  );

  const comments = parseComments(raw);

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-sm font-medium text-neutral-500">댓글</h2>

      <form ref={form} action={action} className="mb-4">
        <textarea
          name="body"
          rows={3}
          placeholder="이 할 일에 대해 남길 말"
          className="w-full resize-y rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          required
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
          >
            {pending ? "남기는 중" : "댓글 남기기"}
          </button>
          {state.error ? (
            <span className="text-sm text-red-700">{state.error}</span>
          ) : null}
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          아직 댓글이 없다.
        </p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment, index) => (
            <li
              key={`${comment.at}-${index}`}
              className="rounded-lg border border-neutral-200 p-3"
            >
              <div className="mb-1 flex gap-2 text-xs text-neutral-500">
                <span className="font-medium text-neutral-700">
                  {comment.author || "(작성자 없음)"}
                </span>
                <span>{comment.at}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
