/**
 * 댓글은 `할일.댓글` 한 칸에 텍스트로 쌓인다. 테이블을 따로 두지 않는다
 * — 한 건에 한두 개 달리는 게 전부라 그만한 무게가 필요 없다.
 *
 * 형식 (최신이 맨 위):
 *
 *   2026-09-14 14:03 배병준
 *   내용. 여러 줄이어도 된다.
 *
 *   2026-09-13 09:20 이시형
 *   앞선 댓글.
 */

export type Comment = {
  at: string;
  author: string;
  body: string;
};

const HEADER = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}) (.+)$/;

function stamp(now: Date): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  // sv-SE는 "2026-09-14 14:03" 형태로 준다.
  return parts;
}

/** 새 댓글을 맨 위에 붙인다. */
export function appendComment(
  existing: string,
  author: string,
  body: string,
  now: Date = new Date(),
): string {
  const entry = `${stamp(now)} ${author}\n${body.trim()}`;
  const rest = existing.trim();
  return rest ? `${entry}\n\n${rest}` : entry;
}

/**
 * 화면에 보여주려고 쪼갠다.
 * 형식에 안 맞는 글(사람이 Airtable에서 직접 적은 것)은 버리지 않고
 * 작성자 없는 한 덩어리로 돌려준다. 내용을 잃는 것보다 낫다.
 */
export function parseComments(raw: string): Comment[] {
  const text = raw.trim();
  if (!text) return [];

  const comments: Comment[] = [];
  let current: Comment | null = null;
  let loose: string[] = [];

  for (const line of text.split("\n")) {
    const match = HEADER.exec(line.trim());

    if (match) {
      if (loose.length > 0) {
        comments.push({ at: "", author: "", body: loose.join("\n").trim() });
        loose = [];
      }
      if (current) comments.push(current);
      current = { at: match[1], author: match[2], body: "" };
      continue;
    }

    if (current) {
      current.body += current.body ? `\n${line}` : line;
    } else {
      loose.push(line);
    }
  }

  if (loose.length > 0) {
    comments.push({ at: "", author: "", body: loose.join("\n").trim() });
  }
  if (current) comments.push(current);

  return comments
    .map((comment) => ({ ...comment, body: comment.body.trim() }))
    .filter((comment) => comment.body !== "");
}
