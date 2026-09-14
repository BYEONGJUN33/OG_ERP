import { ProgramIcon } from "@/components/program-icon";
import { EmptyState, ErrorState } from "@/components/data-state";
import type { Program } from "@/lib/airtable/programs";
import type { Result } from "@/lib/result";

export function ProgramCards({ result }: { result: Result<Program[]> }) {
  if (!result.ok) return <ErrorState message={result.message} />;
  if (result.data.length === 0) {
    return (
      <EmptyState message="표시할 프로그램이 없다. Airtable 프로그램 테이블에서 사용여부를 확인해라." />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {result.data.map((program) => (
        <li key={program.id}>
          <a
            href={program.href}
            target={program.newTab ? "_blank" : undefined}
            rel={program.newTab ? "noreferrer" : undefined}
            className="flex h-full flex-col rounded-lg border border-neutral-200 p-4 transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            <div className="flex items-center gap-2">
              <ProgramIcon name={program.icon} />
              <span className="font-medium">{program.name}</span>
            </div>
            {program.description ? (
              <p className="mt-2 text-sm text-neutral-600">{program.description}</p>
            ) : null}
            <span className="mt-3 text-xs text-neutral-400">{program.category}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
