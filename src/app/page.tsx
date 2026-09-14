import { CalendarEmbed } from "@/components/calendar-embed";
import { ProgramCards } from "@/components/program-cards";
import { TodoList } from "@/components/todo-list";
import { getPrograms } from "@/lib/airtable/programs";
import { getMyTodos } from "@/lib/airtable/todos";
import { auth, signOut } from "@/lib/auth";
import { fail } from "@/lib/result";

export default async function Home() {
  const session = await auth();
  const member = session?.user.member ?? null;

  // 두 구획을 나란히 불러온다. 하나가 실패해도 다른 하나는 그대로 보인다.
  const [programs, todos] = await Promise.all([
    getPrograms(),
    member
      ? getMyTodos(member)
      : Promise.resolve(fail<never[]>("로그인 정보를 읽지 못했다")),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">오픈가든 포털</h1>
          {member ? (
            <p className="mt-1 text-sm text-neutral-600">{member}님</p>
          ) : null}
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
          >
            로그아웃
          </button>
        </form>
      </header>

      <Section title="프로그램">
        <ProgramCards result={programs} />
      </Section>

      <Section title="내 할 일">
        <TodoList result={todos} />
      </Section>

      <Section title="캘린더">
        <CalendarEmbed />
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-medium text-neutral-500">{title}</h2>
      {children}
    </section>
  );
}
