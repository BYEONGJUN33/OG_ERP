import { signIn } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-xl font-semibold">오픈가든 포털</h1>
      <p className="mt-2 text-sm text-neutral-600">
        회사 구글 계정으로 로그인한다.
      </p>

      {error ? (
        <p className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          로그인할 수 없는 계정이다. 회사 계정인지 확인하고,
          그래도 안 되면 관리자에게 알린다.
        </p>
      ) : null}

      <form
        className="mt-8"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="w-full rounded-md bg-neutral-900 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          구글 계정으로 로그인
        </button>
      </form>
    </main>
  );
}
