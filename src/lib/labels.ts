/**
 * 칩 색. 색은 뜻이 있을 때만 쓴다 (docs/design.md).
 *
 * 분류는 종류를 가리키고, 상태는 진행 단계를 가리킨다.
 * 마감이 지났다는 신호는 날짜 글자 색으로만 낸다 — 한 화면에서
 * 같은 색이 두 가지 뜻을 지면 아무 뜻도 못 갖는다.
 */

export const CATEGORY_CHIP: Record<string, string> = {
  영업: "bg-[#e9e2fb] text-[#5a3fa6]",
  수입: "bg-[#deebff] text-[#0747a6]",
  시공: "bg-[#d6f2ef] text-[#116b62]",
  자재: "bg-[#fff0d4] text-[#7a4b00]",
  내부: "bg-[#eceef1] text-[#44546f]",
  기타: "bg-[#eceef1] text-[#44546f]",
};

export const STATUS_CHIP: Record<string, string> = {
  "할 일": "bg-[#eceef1] text-[#44546f]",
  예정: "bg-[#eceef1] text-[#44546f]",
  진행중: "bg-[#deebff] text-[#0747a6]",
  완료: "bg-[#dcf2e5] text-[#0b6b3a]",
  보류: "bg-[#ffe2dd] text-[#ae2e24]",
};

export function categoryChip(name: string): string {
  return CATEGORY_CHIP[name] ?? CATEGORY_CHIP.기타;
}

export function statusChip(name: string): string {
  return STATUS_CHIP[name] ?? STATUS_CHIP.예정;
}

/** 달력 막대에 쓸 hex. 위 칩 색과 같은 값이다. */
export const CATEGORY_HEX: Record<string, string> = {
  영업: "#5a3fa6",
  수입: "#0747a6",
  시공: "#116b62",
  자재: "#7a4b00",
  내부: "#44546f",
  기타: "#44546f",
};

export function categoryHex(name: string): string {
  return CATEGORY_HEX[name] ?? CATEGORY_HEX.기타;
}
