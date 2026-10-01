/**
 * 구글 OAuth 스코프. 여기 한 곳에서만 정의한다.
 */
export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  // 캘린더 목록(이름·색)을 읽는다.
  "https://www.googleapis.com/auth/calendar.readonly",
  // 일정 등록. 포털 창에서 받아 구글에 저장한다 — 저장소·엔진은 여전히 구글. (2026-10-01)
  "https://www.googleapis.com/auth/calendar.events",
] as const;

export const GOOGLE_SCOPE_PARAM = GOOGLE_SCOPES.join(" ");
