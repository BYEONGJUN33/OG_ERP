"use client";

import { useEffect, useRef } from "react";

/**
 * 화면을 떠나지 않고 여는 창.
 * Esc와 바깥 클릭으로 닫힌다 — 둘 다 사람들이 이미 아는 방식이다.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // 뒤 화면이 같이 스크롤되면 어디를 보는지 헷갈린다.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(9,30,66,0.54)] p-4 sm:p-10"
      onMouseDown={(event) => {
        if (!panel.current?.contains(event.target as Node)) onClose();
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${width} rounded-[3px] bg-surface shadow-[0_20px_32px_-8px_rgba(9,30,66,0.25)]`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <span className="text-xs text-muted">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-lg leading-none text-muted hover:text-ink"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
