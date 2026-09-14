import "server-only";

import {
  AirtableError,
  createRecord,
  type FieldValues,
  getRecord,
  selectRecords,
  updateRecord,
} from "@/lib/airtable/client";
import type { MemberName } from "@/config/users";
import { seoulDate, todayInSeoul } from "@/lib/date";
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
  시작일: string;
  마감일: string;
  상태: string;
  완료일시: string;
  분류: string;
  메모: string;
  작성자: string;
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
    start: record.fields.시작일 ?? null,
    status: (record.fields.상태 ?? "예정") as TodoStatus,
    category: record.fields.분류 ?? "",
    memo: record.fields.메모 ?? "",
    completedAt: record.fields.완료일시 ?? null,
    author: record.fields.작성자 ?? "",
  };
}

const FIELDS = [
  "내용",
  "담당자",
  "시작일",
  "마감일",
  "상태",
  "완료일시",
  "분류",
  "메모",
  "작성자",
];

/**
 * 내 할 일 — 본인 담당이면서 아직 끝나지 않은 것.
 * 자주 바뀌므로 1분 캐시.
 */
export async function getMyTodos(member: MemberName): Promise<Result<Todo[]>> {
  try {
    const records = await selectRecords<Row>(TABLE, {
      fields: FIELDS,
      filterByFormula: `AND({담당자} = ${quote(member)}, {상태} != '완료')`,
      revalidate: 60,
    });

    return ok(records.map(toTodo).sort(byDueDate));
  } catch (error) {
    if (error instanceof AirtableError) return fail(error.message);
    throw error;
  }
}

/** 끝나지 않은 할 일 전부. 화면에서 내 것과 팀 것으로 나눈다. */
export async function getOpenTodos(): Promise<Result<Todo[]>> {
  try {
    const records = await selectRecords<Row>(TABLE, {
      fields: FIELDS,
      filterByFormula: "{상태} != '완료'",
      revalidate: 60,
    });

    return ok(records.map(toTodo).sort(byDueDate));
  } catch (error) {
    if (error instanceof AirtableError) return fail(error.message);
    throw error;
  }
}

/**
 * 오늘 끝낸 일 — 담당자 구분 없이 전부.
 *
 * 날짜 비교를 Airtable 수식에 맡기지 않는다. 수식의 TODAY()는 UTC 기준이라
 * 한국 시간 자정 근처에서 하루가 어긋난다. 최근 이틀치만 가져와
 * 한국 시간 날짜로 코드에서 거른다.
 */
export async function getCompletedToday(): Promise<Result<Todo[]>> {
  try {
    const records = await selectRecords<Row>(TABLE, {
      fields: FIELDS,
      filterByFormula:
        "AND({상태} = '완료', IS_AFTER({완료일시}, DATEADD(TODAY(), -2, 'days')))",
      revalidate: 60,
    });

    const today = todayInSeoul();
    const todos = records
      .map(toTodo)
      .filter((todo) => todo.completedAt !== null && seoulDate(todo.completedAt) === today)
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));

    return ok(todos);
  } catch (error) {
    if (error instanceof AirtableError) return fail(error.message);
    throw error;
  }
}

export type NewTodo = {
  title: string;
  owner: MemberName;
  /** 만든 사람. 포털이 채운다. */
  author: MemberName;
  due: string | null;
  category: TodoCategory | null;
};

/** 할 일 추가. 새로 만든 것은 항상 '예정'으로 시작한다. */
export async function createTodo(input: NewTodo): Promise<Result<Todo>> {
  try {
    const fields: FieldValues<Row> = {
      내용: input.title,
      담당자: input.owner,
      작성자: input.author,
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
    // 완료를 풀면 완료일시를 지운다. 비우는 값은 null이어야 한다.
    const fields: FieldValues<Row> = {
      상태: status,
      완료일시: status === "완료" ? new Date().toISOString() : null,
    };

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

/** 할 일 하나. 없으면 null. */
export async function getTodo(id: string): Promise<Result<Todo | null>> {
  try {
    const record = await getRecord<Row>(TABLE, id, 60);
    return ok(record ? toTodo(record) : null);
  } catch (error) {
    if (error instanceof AirtableError) return fail(error.message);
    throw error;
  }
}

export type TodoPatch = {
  title: string;
  owner: MemberName;
  start: string | null;
  due: string | null;
  category: TodoCategory | null;
  memo: string;
};

/**
 * 상세 화면의 저장.
 * 빈 값은 null로 보낸다 — 이래야 칸이 실제로 비워진다.
 * 빈 문자열을 보내면 날짜·단일선택에서 422가 난다.
 * 상태와 완료일시는 여기서 건드리지 않는다. setTodoStatus가 짝으로 관리한다.
 */
export async function updateTodo(
  id: string,
  patch: TodoPatch,
): Promise<Result<Todo>> {
  try {
    const record = await updateRecord<Row>(TABLE, id, {
      내용: patch.title,
      담당자: patch.owner,
      시작일: patch.start,
      마감일: patch.due,
      분류: patch.category,
      메모: patch.memo,
    });
    return ok(toTodo(record));
  } catch (error) {
    if (error instanceof AirtableError) return fail(error.message);
    throw error;
  }
}
