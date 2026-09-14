# 배포 절차

세션이 끊겨도 여기만 보면 이어서 할 수 있게 적어둔다.

## 1. 구글 OAuth (완료)

- 프로젝트 `OG-ERP`, 조직 `open-garden.co.kr`
- 동의 화면: **내부(Internal)** — 검수 불필요, 회사 계정만 로그인 가능
- 승인된 리디렉션 URI 2개
  - `http://localhost:3000/api/auth/callback/google`
  - `https://app.open-garden.co.kr/api/auth/callback/google`

> Vercel 미리보기 배포(`*.vercel.app`)에서는 로그인이 안 된다.
> 리디렉션 URI가 등록되지 않아서다. 정식 도메인에서만 테스트한다.

## 2. 로컬 실행

`.env.example`을 `.env.local`로 복사하고 채운다.

| 변수 | 값 |
|---|---|
| `AUTH_SECRET` | `npx auth secret`로 생성 |
| `AUTH_GOOGLE_ID` | 콘솔에서 받은 클라이언트 ID |
| `AUTH_GOOGLE_SECRET` | 콘솔에서 받은 시크릿 |
| `AUTH_URL` | `http://localhost:3000` |
| `AIRTABLE_TOKEN` | Airtable PAT (아래 3번) |
| `AIRTABLE_BASE_ID` | `appzLstFHtHcQlWSu` |
| `ALLOWED_HD` | `open-garden.co.kr` |
| `GOOGLE_CALENDAR_ID` | 임베드할 캘린더 ID |

## 3. Airtable 토큰

airtable.com/create/tokens 에서 개인 액세스 토큰(PAT) 생성.

- 스코프: `data.records:read` **만**. 쓰기 권한을 주지 않는다(1단계는 읽기 전용).
- 접근 범위: `OpenGarden` 베이스 하나만.
- 토큰은 생성 직후 한 번만 보인다. 못 받으면 다시 만든다.

## 4. Vercel

1. vercel.com → Add New → Project → GitHub `BYEONGJUN33/OG_ERP` 가져오기
2. Framework는 Next.js로 자동 인식된다. Root Directory·빌드 명령은 건드리지 않는다.
3. Environment Variables에 위 표의 값을 넣는다. **단 `AUTH_URL`은 넣지 않는다.**
   (Vercel에서는 요청 헤더로 자동 판단한다. 넣으면 오히려 틀어진다)
4. Deploy
5. Settings → Domains → `app.open-garden.co.kr` 추가
6. Vercel이 알려주는 CNAME 레코드를 DNS에 등록한다
7. 도메인이 붙으면 그 주소로 로그인 테스트

Node 버전은 `package.json`의 `engines.node`로 22 고정. Vercel이 이걸 읽는다.

## 5. 배포 후 확인

- [ ] `/`로 가면 `/login`으로 튕긴다
- [ ] 회사 계정으로 로그인된다
- [ ] 회사 밖 계정은 거부된다
- [ ] 프로그램 카드가 노출순서대로 뜬다
- [ ] 사용여부를 끈 행은 안 보인다
- [ ] 내 할 일이 마감 임박순으로 뜨고, 완료 건은 안 보인다
- [ ] 캘린더가 뜬다
- [ ] 폰에서 열어본다
