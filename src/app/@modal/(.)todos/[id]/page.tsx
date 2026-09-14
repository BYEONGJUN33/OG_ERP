import { notFound } from "next/navigation";

import { ErrorState } from "@/components/data-state";
import { RouteModal } from "@/components/route-modal";
import { TodoComments } from "@/components/todo-comments";
import { TodoDetailForm } from "@/components/todo-detail-form";
import { MEMBERS } from "@/config/users";
import { getTodo } from "@/lib/airtable/todos";

export default async function TodoModalPage({ params }: PageProps<"/todos/[id]">) {
  const { id } = await params;
  const result = await getTodo(id);

  if (result.ok && result.data === null) notFound();

  return (
    <RouteModal title="할 일" width="max-w-4xl">
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-5">
        {result.ok ? (
          <>
            <TodoDetailForm todo={result.data!} members={Object.values(MEMBERS)} />
            <TodoComments id={result.data!.id} raw={result.data!.comments} />
          </>
        ) : (
          <ErrorState message={result.message} />
        )}
      </div>
    </RouteModal>
  );
}
