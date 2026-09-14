/**
 * 포털을 쓸 수 있는 사람 목록.
 *
 * ┌───────────────────────────────────────────────────────────┐
 * │  여기 이메일 두 줄만 실제 구글 계정으로 바꾸면 된다.        │
 * │  여기 없는 이메일은 로그인이 거부된다.                      │
 * └───────────────────────────────────────────────────────────┘
 *
 * 이름은 Airtable `할일.담당자` 단일선택 값과 글자까지 똑같아야 한다.
 * 다르면 "내 할 일"이 빈 목록으로 나온다.
 */
export const MEMBERS = {
  "TODO-1@open-garden.co.kr": "이시형",
  "TODO-2@open-garden.co.kr": "배병준",
} as const satisfies Record<string, string>;

/** Airtable `할일.담당자`가 가질 수 있는 값 */
export type MemberName = (typeof MEMBERS)[keyof typeof MEMBERS];

/** 로그인한 이메일 → 담당자 이름. 목록에 없으면 null */
export function memberNameOf(email: string | null | undefined): MemberName | null {
  if (!email) return null;
  const name = MEMBERS[email.toLowerCase() as keyof typeof MEMBERS];
  return name ?? null;
}
