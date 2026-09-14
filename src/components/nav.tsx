"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "오늘" },
  { href: "/calendar", label: "일정" },
  { href: "/todos", label: "할 일" },
  { href: "/programs", label: "프로그램" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 sm:flex-col">
      {ITEMS.map((item) => {
        // '오늘'은 정확히 일치할 때만. 나머지는 하위 경로도 선택으로 본다.
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-brand-50 font-medium text-brand-700"
                : "text-muted hover:bg-canvas hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
