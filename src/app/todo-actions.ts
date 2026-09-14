"use server";

import { MEMBERS, type MemberName } from "@/config/users";
import {
  addComment,
  createTodo,
  setTodoStatus,
  updateTodo,
} from "@/lib/airtable/todos";
import {
  TODO_CATEGORIES,
  TODO_STATUSES,
  type TodoCategory,
  type TodoStatus,
} from "@/lib/todo-types";
import { auth } from "@/lib/auth";

export type ActionState = { error: string | null };

const MEMBER_NAMES = Object.values(MEMBERS) as MemberName[];

/** 로그인한 구성원만 쓴다. 서버 액션은 누구나 부를 수 있는 입구이므로 매번 확인한다. */
async function requireMember(): Promise<MemberName> {
  const session = await auth();
  const member = session?.user.member;
  if (!member) throw new Error("로그인이 필요하다");
  return member;
}

export async function addTodoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const author = await requireMember();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "할 일 내용을 적어라." };

  const owner = String(formData.get("owner") ?? "");
  if (!MEMBER_NAMES.includes(owner as MemberName)) {
    return { error: "담당자를 고르지 않았다." };
  }

  const due = String(formData.get("due") ?? "").trim();
  const category = String(formData.get("category") ?? "");

  const result = await createTodo({
    title,
    owner: owner as MemberName,
    author,
    due: due || null,
    category: (TODO_CATEGORIES as readonly string[]).includes(category)
      ? (category as TodoCategory)
      : null,
  });

  return { error: result.ok ? null : result.message };
}

export async function setStatusAction(
  id: string,
  status: TodoStatus,
): Promise<ActionState> {
  await requireMember();

  if (!(TODO_STATUSES as readonly string[]).includes(status)) return { error: "알 수 없는 상태다." };

  const result = await setTodoStatus(id, status);
  return { error: result.ok ? null : result.message };
}

export async function saveTodoAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireMember();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "제목을 비울 수 없다." };

  const owner = String(formData.get("owner") ?? "");
  if (!MEMBER_NAMES.includes(owner as MemberName)) {
    return { error: "담당자를 고르지 않았다." };
  }

  const start = String(formData.get("start") ?? "").trim();
  const due = String(formData.get("due") ?? "").trim();
  if (start && due && start > due) {
    return { error: "시작일이 마감일보다 늦다." };
  }

  const category = String(formData.get("category") ?? "");

  const result = await updateTodo(id, {
    title,
    owner: owner as MemberName,
    start: start || null,
    due: due || null,
    category: (TODO_CATEGORIES as readonly string[]).includes(category)
      ? (category as TodoCategory)
      : null,
    memo: String(formData.get("memo") ?? ""),
  });

  return { error: result.ok ? null : result.message };
}

export async function addCommentAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const author = await requireMember();

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "댓글을 적어라." };

  const result = await addComment(id, author, body);
  return { error: result.ok ? null : result.message };
}
