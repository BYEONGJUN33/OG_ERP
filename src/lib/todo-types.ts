/**
 * 할 일의 값과 타입. 서버·클라이언트 양쪽에서 쓴다.
 * Airtable 접근 코드(`server-only`)와 섞으면 클라이언트 번들이 깨지므로 분리한다.
 */

export const TODO_STATUSES = ["예정", "진행중", "완료", "보류"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

export const TODO_CATEGORIES = [
  "영업",
  "수입",
  "시공",
  "자재",
  "내부",
  "기타",
] as const;
export type TodoCategory = (typeof TODO_CATEGORIES)[number];

export type Todo = {
  id: string;
  title: string;
  owner: string;
  /** YYYY-MM-DD. 기한 없는 할 일은 null */
  due: string | null;
  /** YYYY-MM-DD. 비우면 마감일 하루짜리 일 */
  start: string | null;
  status: TodoStatus;
  category: string;
  memo: string;
  /** ISO. 완료가 아니면 null */
  completedAt: string | null;
  author: string;
};
