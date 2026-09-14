import { AppShell } from "@/components/app-shell";
import { ProgramCards } from "@/components/program-cards";
import { getPrograms } from "@/lib/airtable/programs";

export default async function ProgramsPage() {
  const programs = await getPrograms();

  return (
    <AppShell
      title="프로그램"
      subtitle="새 도구는 Airtable 프로그램 표에 한 줄 추가하면 여기 나타난다."
    >
      <ProgramCards result={programs} />
    </AppShell>
  );
}
