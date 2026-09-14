/**
 * 구글 OAuth 스코프. 여기 한 곳에서만 정의한다.
 */
export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  // 캘린더는 읽기만 한다. 일정 등록은 구글 화면으로 넘긴다. (원칙 3)
  "https://www.googleapis.com/auth/calendar.readonly",
] as const;

export const GOOGLE_SCOPE_PARAM = GOOGLE_SCOPES.join(" ");
