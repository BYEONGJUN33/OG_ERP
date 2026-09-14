import { Nav } from "@/components/nav";
import { auth, signOut } from "@/lib/auth";

/**
 * 로그인한 화면의 공통 틀. 사이드바 + 본문.
 * 좁은 화면에서는 사이드바가 위쪽 가로 막대가 된다.
 * 로그인 화면은 이 틀을 쓰지 않는다.
 */
export async function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 py-6 sm:flex-row sm:gap-8">
      <aside className="sm:w-44 sm:shrink-0">
        <div className="mb-4 hidden sm:block">
          <span className="text-sm font-semibold">오픈가든</span>
        </div>

        <Nav />

        <div className="mt-4 hidden border-t border-line pt-4 sm:block">
          <p className="mb-2 text-xs text-muted">{session?.user.member}님</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className="text-xs text-muted hover:text-ink">
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>
          {action}
        </header>

        {children}
      </main>
    </div>
  );
}

export function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="section-title">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
