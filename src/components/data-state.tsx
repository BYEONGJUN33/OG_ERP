"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

/**
 * 외부 API가 실패했을 때 전 화면 공통으로 쓰는 표시. (원칙 6)
 * 흰 화면을 남기지 않고, 항상 다시 시도할 방법을 준다.
 */
export function ErrorState({ message }: { message: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-800">
        불러오지 못했다. 잠시 뒤 다시 시도해라.
      </p>
      <p className="mt-1 text-xs break-all text-red-700/70">{message}</p>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => router.refresh())}
        className="mt-3 rounded-md border border-red-300 bg-surface px-3 py-1.5 text-sm text-red-800 hover:bg-red-100 disabled:opacity-50"
      >
        {pending ? "다시 불러오는 중" : "다시 시도"}
      </button>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">
      {message}
    </div>
  );
}
