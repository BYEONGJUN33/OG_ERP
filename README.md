# 오픈가든 사내 포털

사내 도구를 한 주소로 모으는 포털. 규칙과 설계 결정은 `CLAUDE.md`에 있다.
작업 전에 그 파일을 먼저 읽는다.

## 실행

```bash
node -v      # 22
npm ci
npm run dev
```

`.env.example`을 `.env.local`로 복사하고 값을 채운다.
값은 절대 커밋하지 않는다.

## 문서

- `CLAUDE.md` — 규칙, 원칙, 손대지 않을 것
- `docs/airtable.md` — 테이블 지도
