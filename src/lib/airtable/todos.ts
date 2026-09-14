import "server-only";

import {
  AirtableError,
  createRecord,
  selectRecords,
  updateRecord,
} from "@/lib/airtable/client";
import type { MemberName } from "@/config/users";
import { todayInSeoul } from "@/lib/date";
import { fail, ok, type Result } from "@/lib/result";
import {
  type Todo,
  type TodoCategory,
  type TodoStatus,
} from "@/lib/todo-types";

export type { Todo, TodoCategory, TodoStatus };

const TABLE = "tblczfuo7BoHcmQou";

/** Airtable의 한글 필드명. 이 파일 밖으로 나가지 않는다. */
type Row = {
  내용: string;
  담당자: string;
  마감일: string;
  상태: string;
  완료일시: string;
  분류: string;
  메모: string;
};


/** Airtable 수식에 넣을 문자열을 감싼다. 작은따옴표를 이스케이프한다. */
function quote(value: string): string {
  return `'${value.replace(/'/g, "\\'")}'`;
}

/**
 * 마감 임박순. 기한 없는 할 일은 맨 뒤로 보낸다.
 * (Airtable은 빈 날짜를 오름차순에서 앞에 놓기 때문에 여기서 다시 정렬한다)
 */
function byDueDate(a: Todo, b: Todo): number {
  if (a.due && b.due) return a.due.localeCompare(b.due);
  if (a.due) return -1;
  if (b.due) return 1;
  return a.title.localeCompare(b.title);
}

function toTodo(record: { id: string; fields: Partial<Row> }): Todo {
  return {
    id: record.id,
    title: record.fields.내용 ?? "(제목 없음)",
    owner: record.fields.담당자 ?? "",
    due: record.fields.마감일 ?? null,
    status: (record.fields.상태 ?? "예정") as TodoStatus,
    category: record.fields.분류 ?? "",
    memo: record.fields.메모 ?? "",
  };
}

const OPEN_FIELDS = ["내용", "담당자", "마감일", "상태", "분류", "메모"];

/**
 * 내 할 일 — 본인 담당이면서 아직 끝나지 않은 것.
 * 자주 바뀌므로 1분 캐시.
 */
export async function getMyTodos(member: MemberName): Promise<Result<Todo[]>> {
  try {
    const records = await selectRecords<Row>(TABLE, {
      fields: OPEN_FIELDS,
      filterByFormula: `AND({담당자} = ${quote(member)}, {상태} != '완료')`,
      revalidate: 60,
    });

    return ok(records.map(toTodo).sort(byDueDate));
  } catch (error) {
    if (error instanceof AirtableError) return fail(error.message);
    throw error;
  }
}

export type NewTodo = {
  title: string;
  owner: MemberName;
  due: string | null;
  category: TodoCategory | null;
};

/** 할 일 추가. 새로 만든 것은 항상 '예정'으로 시작한다. */
export async function createTodo(input: NewTodo): Promise<Result<Todo>> {
  try {
    const fields: Partial<Row> = {
      내용: input.title,
      담당자: input.owner,
      상태: "예정",
    };
    if (input.due) fields.마감일 = input.due;
    if (input.category) fields.분류 = input.category;

    const record = await createRecord<Row>(TABLE, fields);
    return ok(toTodo(record));
  } catch (error) {
    if (error instanceof AirtableError) return fail(error.message);
    throw error;
  }
}

/**
 * 상태 변경.
 * 완료로 바꿀 때 완료일시를 함께 찍는다 — 이 칸이 비면 업무일지가 성립하지 않는다.
 * 완료를 풀면 완료일시도 지운다. 끝나지 않은 일에 끝난 시각이 남아 있으면 안 된다.
 */
export async function setTodoStatus(
  id: string,
  status: TodoStatus,
): Promise<Result<Todo>> {
  try {
    const fields: Partial<Row> = { 상태: status };
    fields.완료일시 = status === "완료" ? new Date().toISOString() : "";

    const record = await updateRecord<Row>(TABLE, id, fields);
    return ok(toTodo(record));
  } catch (error) {
    if (error instanceof AirtableError) return fail(error.message);
    throw error;
  }
}

/** 오늘 마감이거나 이미 지난 것, 그리고 진행중인 것. '오늘' 화면용. */
export function isDueTodayOrOverdue(todo: Todo, today = todayInSeoul()): boolean {
  if (todo.status === "완료") return false;
  if (todo.status === "진행중") return true;
  return todo.due !== null && todo.due <= today;
}
