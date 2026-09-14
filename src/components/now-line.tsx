"use client";

import { useSyncExternalStore } from "react";

/** 한국 시간 기준 지금이 자정에서 몇 분 지났는지 */
function nowMinutes(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const [h, m] = parts.split(":").map(Number);
  return h * 60 + m;
}

function subscribe(notify: () => void): () => void {
  const timer = setInterval(notify, 60_000);
  return () => clearInterval(timer);
}

/** 서버에서는 그리지 않는다. 시각은 브라우저가 열려 있는 동안 움직여야 한다. */
const SERVER = -1;

/**
 * 지금 시각을 가리키는 선. 1분마다 내려간다.
 */
export function NowLine({
  fromMin,
  pxPerMin,
}: {
  fromMin: number;
  pxPerMin: number;
}) {
  const minutes = useSyncExternalStore(subscribe, nowMinutes, () => SERVER);

  if (minutes === SERVER) return null;

  const top = (minutes - fromMin) * pxPerMin;
  if (top < 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-0 left-0 z-10 border-t border-danger"
      style={{ top }}
    >
      <span className="absolute -top-1 -left-1 block h-2 w-2 rounded-full bg-danger" />
    </div>
  );
}
