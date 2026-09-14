/**
 * 구글 OAuth 스코프. 여기 한 곳에서만 정의한다.
 * 2단계에서 캘린더 읽기 스코프가 추가된다.
 */
export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  // 2단계: "https://www.googleapis.com/auth/calendar.readonly",
] as const;

export const GOOGLE_SCOPE_PARAM = GOOGLE_SCOPES.join(" ");
