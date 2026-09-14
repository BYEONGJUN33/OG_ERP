import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ErrorState } from "@/components/data-state";
import { TodoComments } from "@/components/todo-comments";
import { TodoDetailForm } from "@/components/todo-detail-form";
import { MEMBERS } from "@/config/users";
import { getTodo } from "@/lib/airtable/todos";

export default async function TodoDetailPage({ params }: PageProps<"/todos/[id]">) {
  const { id } = await params;
  const result = await getTodo(id);

  // 조회 자체가 실패한 것과 그런 할 일이 없는 것은 다르다.
  // 앞은 다시 시도할 일이고, 뒤는 없는 주소다.
  if (result.ok && result.data === null) notFound();

  return (
    <AppShell title="할 일">
      {result.ok ? (
        <>
          <TodoDetailForm todo={result.data!} members={Object.values(MEMBERS)} />
          <TodoComments id={result.data!.id} raw={result.data!.comments} />
        </>
      ) : (
        <ErrorState message={result.message} />
      )}
    </AppShell>
  );
}
