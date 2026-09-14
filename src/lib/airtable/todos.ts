import "server-only";

import { AirtableError, selectRecords } from "@/lib/airtable/client";
import type { MemberName } from "@/config/users";
import { fail, ok, type Result } from "@/lib/result";

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

export type TodoStatus = "예정" | "진행중" | "완료" | "보류";

export type Todo = {
  id: string;
  title: string;
  owner: string;
  /** YYYY-MM-DD. 기한 없는 할 일은 null */
  due: string | null;
  status: TodoStatus;
  category: string;
  memo: string;
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
