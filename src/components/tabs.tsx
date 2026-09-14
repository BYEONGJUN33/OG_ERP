import Link from "next/link";

/** 화면 안에서 보기를 바꾸는 탭. 주소에 남으므로 새로고침해도 유지된다. */
export function Tabs({
  items,
  active,
}: {
  items: { href: string; label: string; count?: number }[];
  active: string;
}) {
  return (
    <div className="mb-[18px] flex border-b border-line">
      {items.map((item) => {
        const on = item.label === active;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`-mb-px mr-5 border-b-2 px-1 py-2 text-sm ${
              on
                ? "border-brand-600 font-semibold text-brand-600"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {item.label}
            {item.count !== undefined ? (
              <span className="ml-1.5 text-xs text-faint">{item.count}</span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
