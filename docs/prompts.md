# Prompts: KB 외환 창구 도우미

## 1. 문서 목적

본 문서는 `KB-ParkHyewon-fx-helper` 프로젝트에서 Cursor에게 요청한 주요 프롬프트와 그에 따른 작업 결과를 기록하기 위한 문서이다.

이 문서의 목적은 다음과 같다.

- AI 협업 과정에서 어떤 요청을 했고, 어떤 결과가 나왔는지 추적한다.
- `docs/WORKFLOW.md`의 Plan → Test → Act → Reflect 흐름과 연결하여 작업 이력을 남긴다.
- 이후 작업자가 동일한 맥락을 빠르게 파악할 수 있도록 한다.
- 과제 제출 및 리뷰 시 주요 개발 의사결정의 근거 자료로 활용한다.

본 문서는 제품 요구사항(`docs/PRD.md`), 아키텍처 기준(`docs/ARCHITECTURE.md`), 작업 흐름(`docs/WORKFLOW.md`), Cursor Rules(`.cursor/rules`)와 함께 참고한다.

---

## 2. 기록 원칙

### 2.1 기록 대상

다음과 같은 작업은 기록한다.

- FSD 구조 생성, 레이어 배치, 아키텍처 변경
- 도메인 계산 로직, 테스트, UI 기능 구현
- 문서·Rules·설정 파일 작성
- 빌드/테스트 실패 해결 등 의사결정이 필요한 작업

사소한 오타 수정, 단순 포맷 정리 등은 기록하지 않아도 된다.

### 2.2 기록 시점

- 주요 작업 요청 직후 또는 작업 완료 직후에 기록한다.
- Reflect 단계에서 누락된 항목이 있으면 보완한다.

### 2.3 작성 기준

- 모든 내용은 한국어로 작성한다.
- 사용한 프롬프트는 가능한 한 원문 그대로 남긴다.
- 생성·수정한 파일은 경로 기준으로 구체적으로 적는다.
- 결과 요약에는 성공 여부, 빌드/테스트 결과, 남은 작업을 포함한다.
- 민감정보(API 키, 개인정보, 계정 정보)는 기록하지 않는다.

### 2.4 작업 단계 표기

`docs/WORKFLOW.md` 기준으로 아래 단계 중 하나를 선택한다.

| 단계 | 설명 |
|---|---|
| Plan | 요구사항 정리, 구조 설계, 범위 정의 |
| Test | Vitest 테스트 설계 또는 작성 |
| Act | 실제 코드·설정·문서 구현 |
| Reflect | 작업 정리, 문서화, 결과 검증 |

---

## 3. 기록 템플릿

아래 템플릿을 복사하여 새 작업을 기록한다.

````markdown
### [작업 제목]

- **작업일**: YYYY-MM-DD
- **작업 단계**: Plan / Test / Act / Reflect
- **요청 목적**:
  - (이번 요청으로 달성하려는 목표)
- **사용한 프롬프트**:
  ```text
  (Cursor에 입력한 프롬프트 원문)
  ```
- **생성/수정 파일**:
  - `path/to/file`
- **결과 요약**:
  - (완료 내용, 빌드/테스트 결과, 주요 결정 사항)
- **추가 확인 사항**:
  - (남은 작업, 검토 필요 항목, 후속 작업 제안)
````

---

## 4. 작업 기록

### FSD 기본 폴더 구조 및 App/Dashboard 뼈대 생성

- **작업일**: 2026-07-04
- **작업 단계**: Act
- **요청 목적**:
  - `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/WORKFLOW.md`, `.cursor/rules`를 기준으로 FSD 레이어 구조를 프로젝트에 반영한다.
  - React 19, Vite, TailwindCSS 최신 문법을 context7 MCP로 확인한 뒤, 앱 진입점(`app`)과 대시보드 페이지(`pages/dashboard`) 뼈대를 생성한다.
  - 이후 기능 구현을 위한 widgets, features, entities, shared 기본 폴더와 public API(`index.ts`) 구조를 마련한다.
- **사용한 프롬프트**:
  ```text
  docs/PRD.md, docs/ARCHITECTURE.md, docs/WORKFLOW.md와 .cursor/rules를 참고해줘.
  React 19, Vite, TailwindCSS 최신 문법은 context7 MCP로 확인한 뒤,
  현재 프로젝트의 FSD 구조에 맞게 기본 폴더 구조와 App/Dashboard 뼈대를 생성해줘.
  ```
- **생성/수정 파일**:
  - `vite.config.ts` — `@tailwindcss/vite` 플러그인, `@` 경로 별칭 추가
  - `tsconfig.app.json` — `@/*` paths 설정
  - `index.html` — 앱 제목·`lang="ko"` 변경
  - `src/index.css` — Tailwind CSS v4 `@import 'tailwindcss'` 적용
  - `src/main.tsx` — `@/app` 진입점 연결
  - `src/app/App.tsx`, `src/app/index.ts`
  - `src/pages/dashboard/ui/DashboardPage.tsx`, `src/pages/dashboard/index.ts`
  - `src/widgets/exchange-panel/`, `src/widgets/remittance-panel/`, `src/widgets/transaction-history-panel/`
  - `src/features/calculate-exchange/`, `src/features/calculate-remittance/`, `src/features/add-transaction/`, `src/features/search-transaction/`
  - `src/entities/currency/`, `src/entities/rate/`, `src/entities/remittance/`, `src/entities/transaction/`
  - `src/shared/ui/` (Button, Input, Select, Card), `src/shared/lib/`, `src/shared/config/storageKeys.ts`
  - 삭제: `src/App.tsx`, `src/App.css` (Vite 기본 템플릿 파일)
- **결과 요약**:
  - FSD 6개 레이어(`app`, `pages`, `widgets`, `features`, `entities`, `shared`) 폴더 구조와 슬라이스별 `index.ts` public API를 생성했다.
  - `App` → `DashboardPage` → 3개 탭(환전 계산 / 해외송금 계산 / 거래 기록) → widgets → features 흐름으로 화면 뼈대를 구성했다.
  - React 19 `createRoot` + `StrictMode`, Tailwind CSS v4 Vite 플러그인 방식을 적용했다.
  - `entities/currency`에 통화 타입·상수, `entities/transaction`에 거래 타입 스켈레톤을 추가했다. 계산·저장 로직은 placeholder 상태로 남겨두었다.
  - `npm run build` 성공을 확인했다.
- **추가 확인 사항**:
  - 다음 단계(WORKFLOW Act 순서): `shared/lib` 포맷 유틸 → `entities/rate` 환전 계산 로직 → Vitest 테스트 작성
  - features 폼은 UI 스켈레톤만 있으며, 계산·localStorage 연동은 미구현 상태
  - `entities/rate`, `entities/remittance`, `entities/transaction/model/storage.ts`는 후속 작업에서 구현 예정

### 공용 유틸 및 도메인 엔티티 구현

- **작업일**: 2026-07-04
- **작업 단계**: Act
- **요청 목적**:
  - `shared/lib` 공용 유틸(숫자·포맷·CSV)과 `shared/config` 설정을 구현한다.
  - `entities/currency`, `entities/rate`, `entities/remittance`, `entities/transaction` 도메인 로직을 순수 함수로 작성한다.
  - UI 컴포넌트는 수정하지 않고, 계산·저장 로직을 features 연동 전 단계까지 완성한다.
- **사용한 프롬프트**:
  ```text
  docs/PRD.md, docs/ARCHITECTURE.md, docs/WORKFLOW.md와 .cursor/rules를 참고해줘.

  이번 작업은 공용 유틸과 도메인 엔티티 구현이야.
  아직 UI 컴포넌트 구현은 하지 말고, entities와 shared/lib 중심으로 작업해줘.

  작업 범위:

  1. shared/lib 공용 유틸 작성
  - src/shared/lib/number.ts
    - roundToTwoDecimals(value: number): number
    - roundToInteger(value: number): number
    - percentToDecimal(percent: number): number

  - src/shared/lib/format.ts
    - formatKrw(amount: number): string
    - formatRate(rate: number): string
    - formatPercent(percent: number): string
    - formatForeignAmount(amount: number, currencyCode: string): string

  - src/shared/lib/csv.ts
    - createCsvContent(headers: string[], rows: Array<Array<string | number>>): string
    - downloadCsv(filename: string, content: string): void
    - UTF-8 BOM을 포함해서 Excel에서 한글이 깨지지 않도록 해줘.

  - src/shared/lib/index.ts
    - 위 유틸들을 public API로 export해줘.

  2. shared/config 작성
  - src/shared/config/storageKeys.ts
    - STORAGE_KEYS.transactions = "kb-fx-helper:transactions"
  - src/shared/config/index.ts에서 export해줘.

  3. entities/currency 작성
  - src/entities/currency/model/types.ts
    - CurrencyCode 타입: "USD" | "JPY" | "EUR" | "CNY"
    - CurrencyConfig 인터페이스 작성

  - src/entities/currency/model/constants.ts
    - CURRENCY_CONFIGS 작성
    - USD, EUR, CNY는 unit 1
    - JPY는 unit 100
    - 기본 현찰 스프레드율과 전신환 스프레드율 포함
    - 예시값:
      - USD: cash 1.75, telegraphic 1.0
      - EUR: cash 1.99, telegraphic 1.0
      - JPY: cash 1.75, telegraphic 1.0
      - CNY: cash 2.0, telegraphic 1.0
    - getCurrencyConfig(currencyCode: CurrencyCode) 함수 작성

  - src/entities/currency/index.ts에서 public API export

  4. entities/rate 작성
  - src/entities/rate/model/types.ts
    - ExchangeTransactionType = "CASH_BUY" | "CASH_SELL"
    - ExchangeCalculationInput
    - ExchangeCalculationResult

  - src/entities/rate/model/calculateExchange.ts
    - calculateExchange(input: ExchangeCalculationInput): ExchangeCalculationResult 작성
    - 현찰 살 때:
      적용환율 = 매매기준율 × (1 + 스프레드율 × (1 - 우대율))
    - 현찰 팔 때:
      적용환율 = 매매기준율 × (1 - 스프레드율 × (1 - 우대율))
    - spreadRate, preferentialRate는 사용자가 입력한 % 값으로 받고 내부에서 decimal로 변환해줘.
    - 적용환율은 먼저 소수점 2자리 반올림
    - 원화 금액 = 반올림(외화금액 ÷ 통화단위 × 적용환율)
    - JPY는 unit 100 기준으로 계산
    - 잘못된 입력값은 Error를 throw해줘.

  - src/entities/rate/index.ts에서 public API export

  5. entities/remittance 작성
  - src/entities/remittance/model/types.ts
    - RemittanceCalculationInput
    - RemittanceCalculationResult

  - src/entities/remittance/model/calculateRemittance.ts
    - calculateRemittance(input: RemittanceCalculationInput): RemittanceCalculationResult 작성
    - 전신환 적용환율 = 전신환매도율 × (1 + 전신환 스프레드율 × (1 - 우대율))
    - 원화 환산 금액 = 반올림(송금 외화 금액 ÷ 통화 단위 × 전신환 적용환율)
    - 총 송금 비용 = 원화 환산 금액 + 송금수수료 + 전신료
    - 적용환율은 먼저 소수점 2자리 반올림
    - JPY는 unit 100 기준으로 계산
    - 잘못된 입력값은 Error를 throw해줘.

  - src/entities/remittance/index.ts에서 public API export

  6. entities/transaction 작성
  - src/entities/transaction/model/types.ts
    - TransactionKind = "EXCHANGE" | "REMITTANCE"
    - FxTransaction 인터페이스 작성

  - src/entities/transaction/model/storage.ts
    - getTransactions(): FxTransaction[]
    - saveTransactions(transactions: FxTransaction[]): void
    - addTransaction(transaction: FxTransaction): FxTransaction[]
    - deleteTransaction(transactionId: string): FxTransaction[]
    - searchTransactions(transactions: FxTransaction[], keyword: string): FxTransaction[]
    - localStorage 사용 가능 여부를 고려해서 브라우저 환경에서만 접근하도록 작성
    - STORAGE_KEYS.transactions를 사용하고 key를 하드코딩하지 마.

  - src/entities/transaction/index.ts에서 public API export

  주의사항:
  - FSD 의존 방향을 지켜줘.
  - entities는 features/widgets/pages/app을 import하지 마.
  - 계산 로직은 React 컴포넌트와 분리된 순수 함수로 작성해줘.
  - TypeScript 타입 에러가 없도록 작성해줘.
  - UI 구현은 하지 마.
  - 기존 placeholder index.ts가 있다면 필요한 export로 수정해줘.

  마지막으로 이번 요청의 프롬프트, 생성/수정 파일, 결과 요약, build 결과를 docs/prompts.md에 기록해줘.
  ```
- **생성/수정 파일**:
  - `src/shared/lib/number.ts` — 반올림·퍼센트 변환 유틸
  - `src/shared/lib/format.ts` — 원화·환율·퍼센트·외화 금액 포맷
  - `src/shared/lib/csv.ts` — CSV 생성(UTF-8 BOM 포함)·다운로드
  - `src/shared/lib/index.ts` — public API export
  - `src/shared/config/index.ts` — `STORAGE_KEYS` re-export
  - `src/entities/currency/model/constants.ts` — 통화별 스프레드율(%)·`getCurrencyConfig` 추가
  - `src/entities/currency/index.ts` — `getCurrencyConfig` export 추가
  - `src/entities/rate/model/types.ts` — 환전 계산 입출력 타입
  - `src/entities/rate/model/calculateExchange.ts` — 환전 계산 순수 함수
  - `src/entities/rate/index.ts` — public API export
  - `src/entities/remittance/model/types.ts` — 송금 계산 입출력 타입
  - `src/entities/remittance/model/calculateRemittance.ts` — 송금 계산 순수 함수
  - `src/entities/remittance/index.ts` — public API export
  - `src/entities/transaction/model/storage.ts` — localStorage CRUD·검색
  - `src/entities/transaction/index.ts` — storage 함수 export 추가
- **결과 요약**:
  - `shared/lib`에 숫자·포맷·CSV 유틸을 구현하고 `index.ts`로 일괄 export했다.
  - `entities/currency`에 통화별 기본 스프레드율(%)과 `getCurrencyConfig`를 반영했다.
  - `calculateExchange`, `calculateRemittance`는 PRD 계산식·반올림 규칙·JPY unit 100 처리·한국어 오류 메시지를 적용했다.
  - FSD 동일 레이어 import 금지를 위해 `rate`/`remittance`는 통화 단위를 슬라이스 내부 맵으로 관리했다.
  - `transaction/storage`는 `STORAGE_KEYS.transactions`를 사용하며, 브라우저·localStorage 미지원 환경을 안전하게 처리한다.
  - UI 파일은 수정하지 않았다.
  - `npm run build` 성공.
- **추가 확인 사항**:
  - 다음 단계: Vitest 테스트 작성(`calculateExchange`, `calculateRemittance`, `shared/lib` 포맷·CSV)
  - features/widgets UI와 계산·저장 로직 연동 필요
  - `CURRENCY_CONFIGS`의 스프레드율은 UI 입력 기준 `%` 값(예: 1.75)으로 저장됨

### 시나리오 기반 도메인 계산 로직 및 Vitest 테스트

- **작업일**: 2026-07-04
- **작업 단계**: Test → Act
- **요청 목적**:
  - PRD·ARCHITECTURE·WORKFLOW·Cursor Rules 기준으로 시나리오 기반 Vitest 테스트를 먼저 작성한다.
  - 환전 계산, 해외송금 비용(수수료표 포함), 거래 기록 storage, 예외/경계값을 검증한다.
  - 테스트 통과를 위해 도메인 계산 로직과 송금 수수료 규칙을 구현한다.
  - UI는 수정하지 않는다.
- **사용한 프롬프트**:
  ```text
  docs/PRD.md, docs/ARCHITECTURE.md, docs/WORKFLOW.md와 .cursor/rules를 참고해줘.

  이번 작업은 시나리오 기반으로 도메인 계산 로직과 테스트를 작성하는 작업이야.
  UI 컴포넌트는 아직 구현하지 마.

  작업 순서를 반드시 지켜줘.

  1. 먼저 Vitest 테스트 파일을 작성해줘.
  2. 테스트가 import할 타입과 함수 시그니처가 없으면 필요한 파일과 export를 먼저 만들어줘.
  3. 그 다음 테스트가 통과하도록 계산 함수와 공용 유틸을 구현해줘.
  4. 마지막에 npm.cmd run test와 npm.cmd run build를 실행해줘.
  5. 테스트가 실패하면 기대값을 바꾸지 말고 구현 로직을 수정해줘.

  [환전 계산 테스트] (시나리오 1~6)
  [해외송금 비용 테스트] (수수료표 + 대표 테스트 + 구간 테스트)
  [거래 기록 테스트]
  [예외/경계값 테스트]

  구현 위치: shared/lib, shared/config, entities/currency, rate, remittance, transaction
  ```
- **생성/수정 파일**:
  - `package.json` — `vitest`, `jsdom` devDependency, `test` 스크립트 추가
  - `vite.config.ts` — Vitest 설정(`environment: jsdom`)
  - `tsconfig.app.json`, `tsconfig.node.json` — Vitest 타입 참조
  - `src/entities/rate/model/calculateExchange.test.ts` — 환전 계산 시나리오·예외 테스트
  - `src/entities/remittance/model/calculateRemittance.test.ts` — 송금 계산·수수료 구간·예외 테스트
  - `src/entities/remittance/model/remittanceFees.ts` — 송금수수료표·전신료·검증 함수
  - `src/entities/remittance/model/types.ts` — 입력에서 수수료 필드 제거(자동 계산)
  - `src/entities/remittance/model/calculateRemittance.ts` — 수수료표 기반 자동 계산 반영
  - `src/entities/remittance/index.ts` — `calculateRemittanceFee` 등 public API export
  - `src/entities/transaction/model/storage.test.ts` — localStorage CRUD·검색 테스트
- **결과 요약**:
  - TDD 순서(테스트 작성 → 구현 → 검증)로 28개 테스트를 작성하고 모두 통과했다.
  - 환전 계산 6개 시나리오(USD 살 때/팔 때, JPY unit 100, 우대율 80%/100%)를 검증했다.
  - 해외송금 수수료표를 `calculateRemittanceFee`로 구현하고 구간별 8개 케이스를 검증했다.
  - `calculateRemittance`는 송금수수료·전신료(8,000원)를 자동 산출한다.
  - 거래 기록 storage 6개 시나리오(저장·검색·삭제·localStorage 유지)를 검증했다.
  - `npm.cmd run test` — 3 files, 28 tests passed
  - `npm.cmd run build` — 성공
- **해외송금 수수료표** (README 작성 시 반드시 명시):
  - **송금수수료** (USD 달러 상당액 기준):
    - 500달러 이하: 5,000원
    - 2,000달러 이하: 10,000원
    - 5,000달러 이하: 15,000원
    - 10,000달러 이하: 20,000원
    - 10,000달러 초과: 25,000원
  - **전신료**: 건당 8,000원
- **추가 확인 사항**:
  - `RemittanceCalculationInput`에서 `remittanceFee`/`cableFee` 입력 필드를 제거했으므로, features UI 연동 시 폼·계산 호출부 수정 필요
  - 다음 단계: features/widgets UI와 계산·저장 로직 연동

### UI 구현 및 도메인 로직 연동

- **작업일**: 2026-07-04
- **작업 단계**: Act
- **요청 목적**:
  - 작성 완료된 `calculateExchange`, `calculateRemittance`, 거래 기록 storage를 실제 화면에 연결한다.
  - 환전·해외송금 계산 UI, 거래 기록 추가/목록/검색/삭제/CSV보내기, 대시보드 조립을 구현한다.
  - 기존 테스트 기대값은 수정하지 않는다.
- **사용한 프롬프트**:
  ```text
  docs/PRD.md, docs/ARCHITECTURE.md, docs/WORKFLOW.md와 .cursor/rules를 참고해줘.

  이번 작업은 UI 구현이야.
  이미 작성된 도메인 계산 함수와 거래 기록 저장 함수를 실제 화면에 연결해줘.

  작업 범위:
  1. 환전 계산 UI (features/calculate-exchange)
  2. 해외송금 계산 UI (features/calculate-remittance)
  3. 거래 기록 추가 UI (features/add-transaction)
  4. 거래 기록 목록 UI (widgets/transaction-history-panel)
  5. CSV보내기
  6. 대시보드 조립 (widgets + pages/dashboard)

  npm.cmd run test, npm.cmd run build 실행 후 docs/prompts.md 기록
  ```
- **생성/수정 파일**:
  - `src/features/calculate-exchange/ui/CalculateExchangeForm.tsx` — 폼·계산·결과 표시·JPY 안내
  - `src/features/calculate-remittance/ui/CalculateRemittanceForm.tsx` — 폼·자동 수수료 계산·결과 표시
  - `src/features/add-transaction/ui/AddTransactionForm.tsx` — 고객명/메모·localStorage 저장
  - `src/features/search-transaction/ui/TransactionSearchInput.tsx` — 검색 입력(제어 컴포넌트)
  - `src/widgets/exchange-panel/ui/ExchangePanel.tsx` — 환전 계산 + 거래 기록 추가 조합
  - `src/widgets/remittance-panel/ui/RemittancePanel.tsx` — 송금 계산 + 거래 기록 추가 조합
  - `src/widgets/transaction-history-panel/ui/TransactionHistoryPanel.tsx` — 목록·검색·삭제·CSV
  - `src/pages/dashboard/ui/DashboardPage.tsx` — 단일 화면 대시보드(반응형 2열 + 거래 기록)
  - `src/entities/transaction/model/types.ts` — `TransactionCalculationSnapshot` 타입 추가
  - `src/entities/transaction/index.ts` — snapshot 타입 export
- **결과 요약**:
  - `calculateExchange`/`calculateRemittance`를 폼 submit 시 호출하고 `shared/lib` 포맷 유틸로 결과를 표시했다.
  - 통화 선택 시 `getCurrencyConfig`로 기본 스프레드율을 자동 채웠다.
  - 해외송금 UI에서 송금수수료·전신료는 entities 자동 계산, 중계수수료는 안내 문구만 표시했다.
  - `DashboardPage`에서 거래 기록 상태를 관리하고 저장·삭제 직후 목록에 즉시 반영되도록 했다.
  - CSV보내기는 `createCsvContent` + `downloadCsv`로 `fx-transactions.csv`(UTF-8 BOM) 다운로드.
  - 탭 UI를 제거하고 환전·송금·거래 기록 카드를 한 화면에 배치했다.
  - `npm.cmd run test` — 3 files, 28 tests passed
  - `npm.cmd run build` — 성공
- **해외송금 수수료표** (README 작성 시 반드시 명시):
  - **송금수수료** (USD 달러 상당액 기준):
    - 500달러 이하: 5,000원
    - 2,000달러 이하: 10,000원
    - 5,000달러 이하: 15,000원
    - 10,000달러 이하: 20,000원
    - 10,000달러 초과: 25,000원
  - **전신료**: 건당 8,000원
  - **중계수수료**: 통화별·은행별로 달라 기본 계산에 미포함(UI 안내 문구 표시)
- **추가 확인 사항**:
  - `npm run dev`로 화면 동작 수동 확인 권장
  - README.md 작성 시 위 수수료표 반영 필요

### UI/UX 개선 — 계산기 탭 전환 및 폼 레이아웃

- **작업일**: 2026-07-04
- **작업 단계**: Act
- **요청 목적**:
  - 환전·해외송금 계산기를 한 카드 탭 UI로 통합해 화면 길이와 복잡도를 줄인다.
  - 입력 폼을 2열 그리드(모바일 1열)로 정리한다.
  - 해외송금 수수료 안내를 표 형태로 개선하고 중계수수료 문구를 제거한다.
  - 도메인 계산 로직과 테스트 기대값은 변경하지 않는다.
- **사용한 프롬프트**:
  ```text
  이번 작업에서는 UI/UX를 개선해줘.

  1. 환전 계산 / 해외송금 계산을 탭으로 전환 (하나의 계산 카드)
  2. 계산기 입력 폼 한 행에 2개씩 반응형 배치
  3. 해외송금 수수료 안내 표 형태로 정리, 중계수수료 문구 삭제

  npm.cmd run test, npm.cmd run build 실행 후 docs/prompts.md 기록
  ```
- **생성/수정 파일**:
  - `src/widgets/calculation-panel/ui/CalculationPanel.tsx` — 탭 전환·계산기·거래 기록 추가 조합 (신규)
  - `src/widgets/calculation-panel/index.ts` — public API (신규)
  - `src/features/calculate-exchange/ui/CalculateExchangeForm.tsx` — 2열 그리드·`embedded` 모드
  - `src/features/calculate-remittance/ui/CalculateRemittanceForm.tsx` — 2열 그리드·수수료 표·`embedded` 모드
  - `src/pages/dashboard/ui/DashboardPage.tsx` — `CalculationPanel` 단일 섹션으로 교체
- **결과 요약**:
  - 환전/해외송금 계산기를 `CalculationPanel` 하나의 카드에서 탭으로 전환하도록 변경했다.
  - 탭 전환 시 `hidden`으로 표시만 바꿔 각 계산기의 입력값·결과 상태가 유지된다.
  - 선택된 탭에 파란색(`border-blue-600 text-blue-600`) 강조 스타일을 적용했다.
  - 입력 폼은 `grid-cols-1 md:grid-cols-2`로 데스크톱 2열·모바일 1열 배치했다.
  - 해외송금 수수료 안내를 “해외송금 수수료 안내” 표로 정리하고 전신료 행을 포함했다.
  - 중계수수료 안내 문구를 화면에서 제거했다.
  - 도메인 로직(entities)은 수정하지 않았다.
  - `npm.cmd run test` — 3 files, 28 tests passed
  - `npm.cmd run build` — 성공
- **추가 확인 사항**:
  - `exchange-panel`/`remittance-panel` 위젯은 FSD 구조상 유지되나 대시보드에서는 `calculation-panel`로 대체됨
  - `npm run dev`로 탭 전환·반응형 레이아웃 수동 확인 권장

### 환율 API 연동 가능성 검토 및 설계 문서 작성

- **작업일**: 2026-07-04
- **작업 단계**: Plan
- **요청 목적**:
  - 한국수출입은행·공공 환율 API를 사용해 USD/JPY/EUR/CNY 환율 연동 가능성을 검토한다.
  - CORS, API 키 관리, FSD 배치, fallback 전략을 정리하고 구현은 하지 않는다.
  - 산출물로 `docs/API_PLAN.md`만 작성한다.
- **사용한 프롬프트**:
  ```text
  docs/PRD.md, docs/ARCHITECTURE.md, docs/WORKFLOW.md와 .cursor/rules를 참고해줘.

  이번 작업은 환율 API 연동 가능성을 검토하고, 구현 설계를 먼저 정리하는 작업이야.
  아직 코드는 수정하지 마.

  요구사항:
  1. 한국수출입은행 환율 API 또는 공공 환율 API 검토
  2. context7 MCP와 공식 API 문서 참고
  3. 브라우저 직접 호출 CORS 확인
  4. API 키 하드코딩 방지 방안
  5. FSD 레이어·파일 설계
  6. API 실패 시 수동 입력 fallback
  7. docs/API_PLAN.md만 작성

  작업 완료 후 docs/prompts.md 기록
  ```
- **생성/수정 파일**:
  - `docs/API_PLAN.md` — 환율 API 연동 검토·설계 문서 (신규)
  - `docs/prompts.md` — 작업 기록 추가
- **결과 요약**:
  - **권장 API:** 공공데이터포털 「한국수출입은행 환율 정보」, 신규 도메인 `oapi.koreaexim.go.kr`, `data=AP01`
  - **필드 매핑:** `deal_bas_r` → 매매기준율, `tts` → 전신환매도율, `JPY(100)` → unit 100
  - **CORS:** 브라우저 직접 호출은 차단 가능성 높음 → Vite dev proxy 또는 서버리스 BFF 권장
  - **API 키:** 소스 하드코딩 금지, `VITE_` 접두사 사용 금지(클라이언트 노출), `.env.local` + 프록시 서버 주입
  - **FSD:** `shared/api` 호출, `entities/exchange-rate` 파싱, `features/load-exchange-rates` 사용자 행동
  - **Fallback:** API 실패 시 입력값 유지·수동 입력·기존 계산 로직 그대로 동작
  - 코드 변경 없음 (`npm run test` / `npm run build` 미실행)
- **추가 확인 사항**:
  - 구현 단계에서 Vite proxy·`parseKoreaEximRates` Vitest 테스트부터 진행 권장
  - README 작성 시 `docs/API_PLAN.md`의 수수료표·API 주의사항과 함께 반영

### 환율 API 불러오기 기능 구현

- **작업일**: 2026-07-04
- **작업 단계**: Act / Reflect
- **요청 목적**:
  - 한국수출입은행 환율 API를 연동해 환전·해외송금 계산 탭에서 환율을 불러온다.
  - API 실패 시에도 수동 입력으로 계산을 계속할 수 있게 한다.
  - API 환율과 수동 입력을 구분해 안내하고, JPY 100엔당 단위를 표시한다.
- **사용한 프롬프트**:
  ```text
  docs/API_PLAN.md, docs/PRD.md, docs/ARCHITECTURE.md와 .cursor/rules를 참고해줘.

  환율 API 불러오기 기능을 구현해줘.

  요구사항:
  1. shared/api/exchangeRateClient.ts 작성
  2. API 키는 .env의 VITE_EXCHANGE_API_KEY에서 읽기
  3. API 호출 실패 시 화면이 깨지지 않고 수동 입력 유지
  4. 환전/해외송금 탭에 환율 불러오기 버튼 추가
  5. 매매기준율/전신환매도율 입력값에 API 환율 채우기
  6. API/수동 입력 구분 안내 문구
  7. JPY 100엔당 단위 표시
  8. test와 build 실행

  작업 완료 후 npm.cmd run test와 npm.cmd run build 실행하고 docs/prompts.md에 기록
  ```
- **생성/수정 파일**:
  - `src/shared/api/exchangeRateClient.ts` — `fetchKoreaEximExchangeRates()` (raw API 호출, DEV 프록시 경로)
  - `src/shared/api/types.ts` — `KoreaEximExchangeRateItem` 타입
  - `src/shared/api/index.ts` — public API
  - `src/shared/config/exchangeRateApi.ts` — API URL·프록시·조회 일수 상수
  - `src/entities/exchange-rate/model/parseKoreaEximRates.ts` — `deal_bas_r`/`tts` 파싱, JPY `JPY(100)` 매핑
  - `src/entities/exchange-rate/model/loadExchangeRateQuote.ts` — 최근 7일 역순 조회·파싱 조합
  - `src/entities/exchange-rate/model/parseKoreaEximRates.test.ts` — USD/JPY 파싱 테스트 (신규)
  - `src/entities/exchange-rate/ui/LoadExchangeRateButton.tsx` — 환전용 불러오기 버튼
  - `src/entities/exchange-rate/ui/LoadRemittanceRateButton.tsx` — 해외송금용 불러오기 버튼
  - `src/entities/exchange-rate/ui/RateSourceNotice.tsx` — API/수동 입력·단위 안내
  - `src/features/calculate-exchange/ui/CalculateExchangeForm.tsx` — 불러오기 버튼·상태 연동
  - `src/features/calculate-remittance/ui/CalculateRemittanceForm.tsx` — 불러오기 버튼·상태 연동
  - `vite.config.ts` — DEV `/api/exchange-rates` 프록시 (`VITE_EXCHANGE_API_KEY` 서버 주입)
  - `src/vite-env.d.ts` — `VITE_EXCHANGE_API_KEY` 타입
  - `.env.example` — API 키 설정 예시
- **결과 요약**:
  - FSD 의존 방향 준수: `shared/api`는 raw fetch만 담당, 파싱·조합은 `entities/exchange-rate`에서 처리
  - 환전 탭: API `deal_bas_r`(매매기준율) 자동 입력 / 해외송금 탭: `tts`(전신환매도율) 자동 입력
  - API 성공 시 녹색 안내(고시일·단위), 수동 수정 시 회색 안내로 전환
  - API 실패 시 amber 경고만 표시하고 기존 입력·계산 폼은 그대로 사용 가능
  - JPY는 API `JPY(100)`·화면 `100엔당` 단위로 일치 확인
  - DEV: Vite 프록시로 CORS 회피 / PROD: `VITE_EXCHANGE_API_KEY`로 직접 호출 (CORS 제한 시 별도 BFF 필요할 수 있음)
  - 기존 `entities/rate`, `entities/remittance` 계산 로직은 변경하지 않음
  - `npm.cmd run test` — 4 files, **31 tests passed**
  - `npm.cmd run build` — **성공**
- **추가 확인 사항**:
  - `.env`에 `VITE_EXCHANGE_API_KEY` 설정 후 `npm run dev`로 실제 API 호출 수동 확인 권장
  - 프로덕션 배포 시 CORS 차단 여부에 따라 `docs/API_PLAN.md`의 BFF·프록시 전략 검토 필요

### 환율 불러오기 전 영업일 fallback 개선

- **작업일**: 2026-07-04
- **작업 단계**: Act / Reflect
- **요청 목적**:
  - 휴일·고시 전 등 오늘 환율 데이터가 없을 때 최대 7일 전까지 하루씩 과거 날짜를 조회해 가장 가까운 전 영업일 환율을 사용한다.
  - 조회 성공 날짜와 전 영업일 여부를 화면에 명확히 안내한다.
- **사용한 프롬프트**:
  ```text
  환율 불러오기 기능을 개선해줘.

  요구사항:
  1. 오늘 데이터 없으면 최대 7일 전까지 하루씩 과거 조회
  2. 전 영업일 데이터: "오늘은 환율 고시 데이터가 없어 전 영업일(YYYY-MM-DD) 환율 정보를 불러왔습니다."
  3. 오늘 데이터: "YYYY-MM-DD 기준 환율 정보를 불러왔습니다."
  4. API 함수가 실제 조회 성공 날짜도 반환
  5. 환전=매매기준율, 해외송금=전신환매도율 자동 입력
  6. 7일 이내 없으면 수동 입력 안내
  7. 기존 계산 로직·테스트 기대값 수정 금지
  8. API 호출은 shared/api에서 처리
  9. npm.cmd run test, npm.cmd run build 실행
  10. docs/prompts.md 기록
  ```
- **생성/수정 파일**:
  - `src/shared/api/errors.ts` — `ExchangeRateDateNotAvailableError` (조회일 데이터 없음, 신규)
  - `src/shared/api/exchangeRateClient.ts` — `null`/빈 배열·유효하지 않은 응답 처리, `{ searchDate, items }` 반환
  - `src/shared/api/types.ts` — `KoreaEximExchangeRatesResult` 타입 추가
  - `src/entities/exchange-rate/model/loadExchangeRateQuote.ts` — 재시도 조건 정리, `isPreviousBusinessDay` 설정
  - `src/entities/exchange-rate/model/loadExchangeRateQuote.test.ts` — 전 영업일 fallback·7일 실패 테스트 (신규)
  - `src/entities/exchange-rate/model/types.ts` — `isPreviousBusinessDay` 필드 추가
  - `src/entities/exchange-rate/ui/RateSourceNotice.tsx` — 당일/전 영업일 안내 문구 분기
  - `src/entities/exchange-rate/ui/LoadExchangeRateButton.tsx` — `isPreviousBusinessDay` 메타 전달
  - `src/entities/exchange-rate/ui/LoadRemittanceRateButton.tsx` — 동일
  - `src/features/calculate-exchange/ui/CalculateExchangeForm.tsx` — `isPreviousBusinessDay` 상태 연동
  - `src/features/calculate-remittance/ui/CalculateRemittanceForm.tsx` — 동일
- **결과 요약**:
  - API가 `null`·빈 배열·`result !== 1` 응답을 반환해도 해당 날짜를 건너뛰고 다음 과거일을 조회한다.
  - 인증키 미설정·HTTP 오류 등 치명적 오류는 즉시 중단하고, 데이터 없음만 최대 7일 재시도한다.
  - `fetchKoreaEximExchangeRates`가 `searchDate`와 `items`를 함께 반환하고, `loadExchangeRateQuote`가 `quotedDate`·`isPreviousBusinessDay`를 UI에 전달한다.
  - 7일 이내 데이터 없음: `최근 7일 이내 환율 고시 데이터를 찾을 수 없습니다.` + 수동 입력 안내
  - 기존 `calculateExchange`·`calculateRemittance`·`storage` 테스트 기대값은 변경하지 않음
  - `npm.cmd run test` — 5 files, **34 tests passed**
  - `npm.cmd run build` — **성공**
- **추가 확인 사항**:
  - 휴일·주말에 `npm run dev`로 전 영업일 fallback 메시지 수동 확인 권장

### 환율 API 통화 목록 개선 (CNH 전환·신규 통화 추가)

- **작업일**: 2026-07-04
- **작업 단계**: Act / Reflect
- **요청 목적**:
  - CNY를 CNH(중국 위안)로 변경하고 API 매핑을 정리한다.
  - THB, SGD, IDR, HKD 통화를 환전·해외송금 계산에 추가한다.
  - JPY·IDR 100단위 고시환율 처리와 안내 문구를 반영한다.
- **사용한 프롬프트**:
  ```text
  환율 API 및 통화 목록을 개선해줘.

  1. CNY → CNH 변경, 화면 "CNH (중국 위안)"
  2. THB, SGD, IDR, HKD 통화 추가
  3. USD/EUR/CNH/THB/SGD/HKD unit 1, JPY/IDR unit 100
  4. API JPY(100), IDR(100), CNH 매핑 및 통화 미발견 안내
  5. 기존 계산 공식·채점 테스트 기대값 유지
  6. CNH·신규 통화·IDR unit 테스트 추가
  7. docs/prompts.md 기록, README 메모
  ```
- **생성/수정 파일**:
  - `src/entities/currency/model/types.ts` — `CNH`, `THB`, `SGD`, `IDR`, `HKD` 추가, `CNY` 제거
  - `src/entities/currency/model/constants.ts` — 통화 설정·`formatCurrencyUnitLabel`·`isHundredUnitCurrency` 추가
  - `src/entities/currency/model/constants.test.ts` — CNH·신규 통화·IDR unit 테스트 (신규)
  - `src/entities/exchange-rate/model/parseKoreaEximRates.ts` — `CNH`, `IDR(100)` 등 API 매핑, 통화 미발견 메시지
  - `src/entities/exchange-rate/model/parseKoreaEximRates.test.ts` — CNH·IDR 파싱 테스트 보강
  - `src/entities/rate/model/calculateExchange.ts` — `getCurrencyConfig`로 단위 조회 (공식 유지)
  - `src/entities/remittance/model/calculateRemittance.ts` — 동일
  - `src/features/calculate-exchange/ui/CalculateExchangeForm.tsx` — JPY·IDR 100단위 안내
  - `src/features/calculate-remittance/ui/CalculateRemittanceForm.tsx` — 동일
- **결과 요약**:
  - 지원 통화: USD, JPY, EUR, **CNH**, **THB**, **SGD**, **IDR**, **HKD** (8종)
  - 화면 표시: `CNH (중국 위안)`, `IDR (인도네시아 루피아)` 등
  - 100단위 통화: JPY(100엔당), IDR(100루피아당) — 계산·API·안내 문구 일치
  - 통화 미발견 시: `선택한 통화의 환율 정보를 찾을 수 없습니다. 직접 입력해주세요.`
  - 기존 채점 시나리오(`calculateExchange`·`calculateRemittance`·`storage`) 테스트 기대값 변경 없음
  - `npm.cmd run test` — 6 files, **41 tests passed**
  - `npm.cmd run build` — **성공**
- **추가 확인 사항**:
  - **README.md 작성 시 메모:** 지원 통화 8종(USD, JPY, EUR, CNH, THB, SGD, IDR, HKD)과 100단위 고시환율 통화(JPY, IDR)를 명시할 것
  - `docs/API_PLAN.md`·`docs/PRD.md`의 CNY 언급은 README/문서 정리 단계에서 CNH·신규 통화로 갱신 권장

### README.md 제출용 문서 보완

- **작업일**: 2026-07-04
- **작업 단계**: Reflect
- **요청 목적**:
  - 제출용 README.md를 PRD·아키텍처·워크플로·prompts 기준으로 보완한다.
  - 프로젝트 개요, 기능, 기술 스택, 실행 방법, 환경변수, 통화·계산 기준, FSD 구조, AI 협업 방식을 한 문서에 정리한다.
- **사용한 프롬프트**:
  ```text
  README.md를 제출용 문서 수준으로 보완해줘.
  docs/PRD.md, ARCHITECTURE.md, WORKFLOW.md, prompts.md 참고.
  프로젝트 개요, 주요 기능, 기술 스택, 실행 방법, 환경변수, 지원 통화,
  계산 기준, 해외송금 수수료표, FSD 구조, 테스트·AI 협업, 주의사항 포함.
  코드 로직은 수정하지 말고 README.md만 수정.
  npm.cmd run test, npm.cmd run build 실행 후 docs/prompts.md 기록.
  ```
- **생성/수정 파일**:
  - `README.md` — 제출용 문서 전면 작성 (Vite 기본 템플릿 README 교체)
  - `docs/prompts.md` — 작업 기록 추가
- **결과 요약**:
  - 프로젝트 개요·학습/과제용 면책 문구, 8종 지원 통화(JPY·IDR 100단위 명시) 반영
  - 환율 API·전 영업일 fallback·localStorage·CSV 기능 설명 추가
  - 계산식·반올림 규칙·해외송금 수수료표(과제용 예시) 정리
  - FSD 레이어 구조·의존 방향, Plan→Test→Act→Reflect, Cursor Rules·Context7·CodeRabbit 안내
  - `.env` / `VITE_EXCHANGE_API_KEY` 설정·보안 주의사항 포함
  - 코드 로직 변경 없음
  - `npm.cmd run test` — 6 files, **41 tests passed**
  - `npm.cmd run build` — **성공**
- **추가 확인 사항**:
  - `.env.example`에 실제 API 키가 포함되어 있다면 별도로 placeholder로 교체 권장 (README에는 `your_api_key_here` 예시만 기재)

### CodeRabbit 설정 파일 생성

- **작업일**: 2026-07-04
- **작업 단계**: Act / Reflect
- **요청 목적**:
  - PR 자동 코드 리뷰를 위한 `.coderabbit.yaml`을 프로젝트 루트에 생성한다.
  - FSD·도메인·보안·테스트·문서 일치 기준을 path_instructions에 반영한다.
- **사용한 프롬프트**:
  ```text
  프로젝트 루트에 .coderabbit.yaml 생성.
  ko-KR, chill, request_changes_workflow false, high_level_summary true, poem false.
  node_modules/dist/coverage/lock/.env/log 제외.
  src 레이어·테스트·docs·.env.example path_instructions.
  FSD, 계산/UI 분리, JPY/IDR 100단위, API 키, 테스트, 문서 일치 중점 리뷰.
  README 보완, test/build 실행, prompts.md 기록.
  ```
- **생성/수정 파일**:
  - `.coderabbit.yaml` — CodeRabbit 리뷰 설정 (신규)
  - `README.md` — CodeRabbit 섹션 보완 (`.coderabbit.yaml` 안내)
  - `docs/prompts.md` — 작업 기록 추가
- **결과 요약**:
  - 리뷰 언어 `ko-KR`, 프로필 `chill`, poem 비활성화, high_level_summary 활성화
  - `path_filters`로 node_modules·dist·coverage·lock·.env·log 제외 (.env.example은 리뷰 대상 유지)
  - `src/entities|features|widgets|pages|shared`, 테스트, `docs/**`, `.env.example`별 path_instructions 작성
  - 전역 instructions에 FSD·계산/UI 분리·100단위·API 키·테스트·문서 일치 기준 명시
  - 코드 로직 변경 없음
  - `npm.cmd run test` — 6 files, **41 tests passed**
  - `npm.cmd run build` — **성공**
- **추가 확인 사항**:
  - GitHub 저장소에 CodeRabbit 앱 연동 후 PR에서 실제 리뷰 동작 확인 권장
