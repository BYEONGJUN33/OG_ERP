import "server-only";

/**
 * Airtable REST 호출은 전부 이 파일을 통과한다.
 * 토큰을 쓰는 곳이 여기 하나뿐이어야 클라이언트로 새지 않는다. (원칙 1)
 * 나중에 Postgres로 옮기더라도 갈아끼울 곳이 여기다. (11번)
 */

const API = "https://api.airtable.com/v0";

export type AirtableRecord<F> = { id: string; fields: Partial<F> };

type Query = {
  /** 가져올 필드 이름. 비우지 마라 — 전체 레코드를 끌면 한도가 빨리 닳는다. */
  fields: string[];
  filterByFormula?: string;
  sort?: { field: string; direction: "asc" | "desc" }[];
  maxRecords?: number;
  /** 초 단위 캐시. 새로고침마다 전체 읽기 금지. */
  revalidate: number;
};

export class AirtableError extends Error {}

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new AirtableError(`환경변수 ${name}가 없다`);
  return value;
}

/**
 * 한 테이블을 읽는다. 100건이 넘으면 offset을 따라가며 이어 읽는다.
 * 페이지가 10장을 넘으면 멈춘다 — 그만큼 크면 화면 쪽 설계가 잘못된 것이다.
 */
export async function selectRecords<F>(
  tableId: string,
  query: Query,
): Promise<AirtableRecord<F>[]> {
  const token = env("AIRTABLE_TOKEN");
  const baseId = env("AIRTABLE_BASE_ID");

  const records: AirtableRecord<F>[] = [];
  let offset: string | undefined;

  for (let page = 0; page < 10; page += 1) {
    const params = new URLSearchParams();
    for (const field of query.fields) params.append("fields[]", field);
    if (query.filterByFormula) params.set("filterByFormula", query.filterByFormula);
    query.sort?.forEach((s, i) => {
      params.set(`sort[${i}][field]`, s.field);
      params.set(`sort[${i}][direction]`, s.direction);
    });
    if (query.maxRecords) params.set("maxRecords", String(query.maxRecords));
    if (offset) params.set("offset", offset);

    const response = await fetch(`${API}/${baseId}/${tableId}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: query.revalidate },
    });

    if (!response.ok) {
      throw new AirtableError(
        `Airtable ${response.status} ${response.statusText} (table ${tableId})`,
      );
    }

    const body = (await response.json()) as {
      records: AirtableRecord<F>[];
      offset?: string;
    };

    records.push(...body.records);
    offset = body.offset;
    if (!offset) break;
  }

  return records;
}
