/**
 * 데이터 조회 결과. 실패를 예외로 던지지 않고 값으로 돌려준다.
 * 한 화면의 한 구획이 실패해도 나머지 구획은 그대로 보이게 하려는 것이다.
 * (원칙 6 — 흰 화면 금지)
 */
export type Result<T> = { ok: true; data: T } | { ok: false; message: string };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function fail<T>(message: string): Result<T> {
  return { ok: false, message };
}
