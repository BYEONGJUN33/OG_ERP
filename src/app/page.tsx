import { auth, signOut } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">오픈가든 포털</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {session?.user.member}님으로 로그인했다.
          </p>
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
      </div>

      <p className="mt-10 text-sm text-neutral-500">
        다음 단계는 Airtable 읽기와 프로그램 카드다.
      </p>
    </main>
  );
}
