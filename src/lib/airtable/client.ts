import "server-only";

import { unstable_cache } from "next/cache";

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

/** 401·403은 사람이 고쳐야 하는 설정 문제다. 화면에 무엇을 고쳐야 하는지 적어준다. */
function describe(status: number, statusText: string, tableId: string): string {
  if (status === 401) {
    return "Airtable 토큰이 유효하지 않다. AIRTABLE_TOKEN을 확인해라.";
  }
  if (status === 403) {
    return (
      "Airtable이 접근을 거부했다(403). 토큰에 data.records:read 스코프가 있는지, " +
      "그리고 OpenGarden 베이스가 토큰의 Access 목록에 들어 있는지 확인해라."
    );
  }
  if (status === 429) {
    return "Airtable 호출 한도를 넘었다. 잠시 뒤 다시 시도해라.";
  }
  return `Airtable ${status} ${statusText} (table ${tableId})`;
}

async function fetchAll<F>(
  tableId: string,
  query: Query,
): Promise<AirtableRecord<F>[]> {
  const token = env("AIRTABLE_TOKEN");
  const baseId = env("AIRTABLE_BASE_ID");

  const records: AirtableRecord<F>[] = [];
  let offset: string | undefined;

  // 100건이 넘으면 offset을 따라가며 이어 읽는다.
  // 10장을 넘으면 멈춘다 — 그만큼 크면 화면 쪽 설계가 잘못된 것이다.
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
      // 캐시는 아래 unstable_cache가 맡는다. fetch 자체는 캐시하지 않는다.
      // fetch에 revalidate를 걸면 403 같은 실패 응답까지 캐시되어,
      // 설정을 고친 뒤에도 캐시 기간 내내 같은 에러가 계속 보인다.
      cache: "no-store",
    });

    if (!response.ok) {
      throw new AirtableError(
        describe(response.status, response.statusText, tableId),
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

/**
 * 한 테이블을 읽는다. 성공한 결과만 캐시된다.
 * 실패하면 예외가 나가고 아무것도 저장되지 않으므로, 권한을 고치면 바로 반영된다.
 */
export async function selectRecords<F>(
  tableId: string,
  query: Query,
): Promise<AirtableRecord<F>[]> {
  const key = ["airtable", tableId, JSON.stringify(query)];

  return unstable_cache(() => fetchAll<F>(tableId, query), key, {
    revalidate: query.revalidate,
    tags: [`airtable:${tableId}`],
  })();
}
