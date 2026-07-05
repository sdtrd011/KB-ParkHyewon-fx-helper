# ARCHITECTURE: KB 외환 창구 도우미

## 1. 문서 개요

본 문서는 `KB-ParkHyewon-fx-helper` 프로젝트의 프론트엔드 아키텍처를 정의한다.

이 프로젝트는 React 19 + TypeScript + Vite + TailwindCSS 기반의 외환 창구 업무 보조 웹앱이며, 기능이 늘어나도 유지보수하기 쉽도록 FSD(Feature-Sliced Design) 구조를 적용한다.

---

## 2. 아키텍처 목표

본 프로젝트의 아키텍처 목표는 다음과 같다.

1. 코드의 역할과 위치를 명확히 구분한다.
2. Cursor Agent가 한 번에 참고해야 하는 Context 범위를 줄인다.
3. 계산 로직과 UI 코드를 분리하여 테스트 가능성을 높인다.
4. 레이어 간 의존 방향을 제한하여 구조가 무너지지 않게 한다.
5. 여러 사람이 함께 개발해도 파일 배치와 import 규칙을 일관되게 유지한다.

---

## 3. 아키텍처 선택: FSD

### 3.1 FSD를 선택한 이유

중간과제에서는 `src/components`, `src/lib` 중심의 단순 구조를 사용했다.  
하지만 최종과제는 환전 계산기, 해외송금 계산기, 거래 기록 관리, CSV 내보내기, 테스트, Rules, Workflow 등 기능과 문서가 함께 늘어난다.

따라서 단순 폴더 구조보다는 기능과 도메인을 레이어별로 나누는 구조가 더 적합하다.

FSD를 적용하면 다음 장점이 있다.

- 화면, 기능, 도메인, 공용 코드를 구분할 수 있다.
- 기능이 늘어나도 특정 폴더에 코드가 몰리지 않는다.
- Cursor Agent가 작업할 때 수정 범위를 좁힐 수 있다.
- 계산 로직을 `entities` 또는 `shared/lib`에 분리하여 Vitest 테스트가 쉬워진다.
- 레이어별 import 규칙을 Cursor Rules로 강제하기 쉽다.

---

## 4. 전체 레이어 구조

본 프로젝트는 다음 FSD 레이어를 사용한다.

```text
src/
├── app/
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
```

레이어의 의존 방향은 다음과 같다.

```text
app → pages → widgets → features → entities → shared
```

상위 레이어는 자기보다 아래 레이어만 import할 수 있다.  
하위 레이어가 상위 레이어를 import하는 것은 금지한다.

---

## 5. 레이어별 역할

| 레이어 | 역할 | 외환 도우미 예시 |
|---|---|---|
| `app` | 앱 진입점, 전역 설정, 전체 화면 조립 | `App.tsx`, 전역 스타일 연결 |
| `pages` | 페이지 단위 화면 구성 | `dashboard` |
| `widgets` | 페이지를 구성하는 독립 UI 블록 | `calculation-panel`, `transaction-history-panel` |
| `features` | 사용자 행동 단위 기능 | `calculate-exchange`, `calculate-remittance`, `load-exchange-rate`, `add-transaction`, `search-transaction`, `toggle-theme` |
| `entities` | 비즈니스 엔티티, 도메인 타입, 순수 계산 로직 | `rate`, `remittance`, `transaction`, `exchange-rate` |
| `shared` | 공용 UI, 공용 유틸, 설정, API | `ui`, `lib`, `config`, `api` |

---

## 6. 프로젝트 폴더 구조

최종 목표 구조는 다음과 같다.

```text
src/
├── app/
│   ├── App.tsx
│   └── index.ts
├── pages/
│   └── dashboard/
│       ├── ui/
│       │   └── DashboardPage.tsx
│       └── index.ts
├── widgets/
│   ├── calculation-panel/
│   │   ├── ui/
│   │   │   └── CalculationPanel.tsx
│   │   └── index.ts
│   └── transaction-history-panel/
│       ├── ui/
│       │   └── TransactionHistoryPanel.tsx
│       └── index.ts
├── features/
│   ├── calculate-exchange/
│   ├── calculate-remittance/
│   ├── load-exchange-rate/
│   ├── add-transaction/
│   ├── search-transaction/
│   └── toggle-theme/
├── entities/
│   ├── rate/
│   ├── remittance/
│   ├── transaction/
│   └── exchange-rate/
└── shared/
    ├── ui/
    ├── lib/
    ├── config/
    │   ├── currencies.ts
    │   ├── storageKeys.ts
    │   └── exchangeRateApi.ts
    └── api/
        └── exchangeRateClient.ts
```

> 통화 설정(`CurrencyCode`, `getCurrencyConfig` 등)은 `entities/currency`가 아닌 **`shared/config/currencies.ts`** 에 둔다.

---

## 7. 의존 방향 규칙

### 7.1 허용되는 import

상위 레이어는 하위 레이어를 import할 수 있다.

예:

```ts
// app → pages
import { DashboardPage } from "@/pages/dashboard";

// pages → widgets
import { CalculationPanel } from "@/widgets/calculation-panel";
import { TransactionHistoryPanel } from "@/widgets/transaction-history-panel";

// widgets → features
import { CalculateExchangeForm } from "@/features/calculate-exchange";
import { LoadExchangeRateButton } from "@/features/load-exchange-rate";

// features → entities
import { calculateExchange } from "@/entities/rate";

// entities → shared
import { getCurrencyConfig } from "@/shared/config";
import { roundToTwoDecimals } from "@/shared/lib";
```

### 7.2 금지되는 import

하위 레이어가 상위 레이어를 import하면 안 된다.

금지 예:

```ts
// 금지: shared가 entities를 import
import { calculateExchange } from "@/entities/rate";

// 금지: entities가 features를 import
import { CalculateExchangeForm } from "@/features/calculate-exchange";

// 금지: features가 widgets를 import
import { CalculationPanel } from "@/widgets/calculation-panel";

// 금지: widgets가 pages를 import
import { DashboardPage } from "@/pages/dashboard";
```

### 7.3 동일 레이어 슬라이스 간 import 금지

동일 레이어의 서로 다른 슬라이스를 직접 import하지 않는다.

금지 예:

```ts
// 금지: features 내부의 다른 feature 직접 import
import { AddTransactionForm } from "@/features/add-transaction";

// 금지: widgets 내부의 다른 widget 직접 import
import { TransactionHistoryPanel } from "@/widgets/transaction-history-panel";
```

공통으로 필요한 로직은 `entities` 또는 `shared`로 내려서 관리한다.

---

## 8. Public API 규칙

각 슬라이스는 `index.ts`를 통해 외부에 필요한 항목만 공개한다.

### 8.1 허용 예시

```ts
import { calculateExchange } from "@/entities/rate";
import { CalculationPanel } from "@/widgets/calculation-panel";
```

### 8.2 금지 예시

```ts
import { calculateExchange } from "@/entities/rate/model/calculateExchange";
import { CalculationPanel } from "@/widgets/calculation-panel/ui/CalculationPanel";
```

### 8.3 목적

`index.ts` public API를 사용하면 다음 장점이 있다.

- 외부에서 슬라이스 내부 구조를 알 필요가 없다.
- 내부 파일 구조를 바꿔도 import 경로 변경이 줄어든다.
- Cursor Agent가 수정해야 할 경계를 더 명확히 이해할 수 있다.

---

## 9. 도메인 설계

## 9.1 통화 설정 (shared/config)

통화 코드, 통화명, 고시 단위, 기본 스프레드율은 **`shared/config/currencies.ts`** 에서 관리한다.

주요 책임:

- 통화 코드 타입 정의 (`CurrencyCode`)
- 통화별 고시 단위 정의 (JPY·IDR는 `unit: 100`)
- 통화별 기본 현찰·전신환 스프레드율 정의
- `getCurrencyConfig`, `formatCurrencyUnitLabel`, `isHundredUnitCurrency` 제공

파일:

```text
src/shared/config/currencies.ts
src/shared/config/index.ts
```

지원 통화 (8종): USD, JPY, EUR, CNH, THB, SGD, IDR, HKD

예상 타입:

```ts
export type CurrencyCode =
  | "USD" | "JPY" | "EUR" | "CNH" | "THB" | "SGD" | "IDR" | "HKD";

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  unit: 1 | 100;
  defaultCashSpreadRate: number;
  defaultTelegraphicSpreadRate: number;
}
```

---

## 9.2 rate 엔티티

`rate`는 환전 계산 로직을 담당한다.

주요 책임:

- 현찰 살 때 적용환율 계산
- 현찰 팔 때 적용환율 계산
- 우대율 반영
- JPY·IDR 100단위 고시환율 처리 (`shared/config`의 `unit: 100`)
- 원화 금액 계산
- 계산 로직 테스트 제공

예상 파일:

```text
src/entities/rate/model/calculateExchange.ts
src/entities/rate/model/calculateExchange.test.ts
src/entities/rate/index.ts
```

계산식:

```text
현찰 살 때 적용환율 = 매매기준율 × (1 + 스프레드율 × (1 - 우대율))
현찰 팔 때 적용환율 = 매매기준율 × (1 - 스프레드율 × (1 - 우대율))
원화 금액 = 반올림(외화 금액 ÷ 통화 단위 × 적용환율)
```

주의사항:

- 적용환율은 먼저 소수점 2자리로 반올림한다.
- 원화 금액은 정수 원 단위로 반올림한다.
- UI 컴포넌트 내부에 계산식을 작성하지 않는다.

---

## 9.3 remittance 엔티티

`remittance`는 해외송금 비용 계산 로직을 담당한다.

주요 책임:

- 전신환 적용환율 계산
- 송금 외화 금액의 원화 환산
- 송금수수료와 전신료 합산
- 총 송금 비용 계산
- JPY·IDR 100단위 고시환율 처리 (`shared/config`의 `unit: 100`)
- 계산 로직 테스트 제공

예상 파일:

```text
src/entities/remittance/model/calculateRemittance.ts
src/entities/remittance/model/calculateRemittance.test.ts
src/entities/remittance/index.ts
```

계산식:

```text
전신환 적용환율 = 전신환매도율 × (1 + 전신환 스프레드율 × (1 - 우대율))
원화 환산 금액 = 반올림(송금 외화 금액 ÷ 통화 단위 × 전신환 적용환율)
총 송금 비용 = 원화 환산 금액 + 송금수수료 + 전신료
```

---

## 9.4 transaction 엔티티

`transaction`은 거래 기록 타입과 저장 로직을 담당한다.

주요 책임:

- 거래 기록 타입 정의
- 환전 거래와 해외송금 거래 구분
- localStorage 저장
- localStorage 조회
- 거래 삭제
- 거래 검색에 필요한 기본 데이터 제공

예상 파일:

```text
src/entities/transaction/model/types.ts
src/entities/transaction/model/storage.ts
src/entities/transaction/index.ts
```

localStorage key:

```text
kb-fx-helper:transactions
```

---

## 10. shared 설계

## 10.1 shared/ui

`shared/ui`는 여러 화면에서 재사용하는 공용 UI 컴포넌트를 관리한다.

예:

```text
Button.tsx
Input.tsx
Select.tsx
Card.tsx
```

규칙:

- 도메인 용어를 포함하지 않는다.
- 특정 기능에 종속되지 않는다.
- 한국어 문구를 하드코딩하지 않는다.
- 스타일은 TailwindCSS를 사용한다.

---

## 10.2 shared/lib

`shared/lib`는 공용 유틸 함수를 관리한다.

예:

```text
format.ts
number.ts
csv.ts
```

주요 함수 예시:

```ts
formatKrw(amount: number): string
formatRate(rate: number): string
roundToTwoDecimals(value: number): number
downloadCsv(filename: string, rows: string[][]): void
```

규칙:

- 특정 UI에 의존하지 않는다.
- React 컴포넌트를 import하지 않는다.
- 가능한 순수 함수로 작성한다.
- 테스트 가능한 형태로 작성한다.

---

## 10.3 shared/config

`shared/config`는 전역 설정값을 관리한다.

예:

```text
storageKeys.ts
```

예상 값:

```ts
export const STORAGE_KEYS = {
  transactions: "kb-fx-helper:transactions",
  theme: "kb-fx-helper:theme",
} as const;
```

---

## 10.4 shared/api

`shared/api`는 외부 API 클라이언트 영역이다.

이번 구현에서는 한국수출입은행 환율 API를 `shared/api/exchangeRateClient.ts`에서 호출하고, `entities/exchange-rate`에서 파싱·전 영업일 fallback을 처리한다.

규칙:

- API 호출 함수만 둔다.
- 화면 컴포넌트에서 직접 `fetch`를 작성하지 않는다.
- 실제 API 키가 필요한 경우 코드에 직접 하드코딩하지 않는다.

---

## 11. 기능 슬라이스 설계

## 11.1 calculate-exchange

환전 계산 사용자 행동을 담당한다.

예상 책임:

- 환전 계산 입력 폼 제공
- 입력값 상태 관리
- `entities/rate`의 계산 함수 호출
- 계산 결과 표시
- 계산 결과를 거래 기록에 전달할 수 있는 형태로 구성

허용 import:

```text
features/calculate-exchange
→ entities/rate
→ shared/config
→ shared/ui
→ shared/lib
```

---

## 11.2 calculate-remittance

해외송금 비용 계산 사용자 행동을 담당한다.

예상 책임:

- 해외송금 계산 입력 폼 제공
- 입력값 상태 관리
- `entities/remittance`의 계산 함수 호출
- 총 송금 비용 표시
- 계산 결과를 거래 기록에 전달할 수 있는 형태로 구성

허용 import:

```text
features/calculate-remittance
→ entities/remittance
→ shared/config
→ shared/ui
→ shared/lib
```

---

## 11.3 add-transaction

거래 기록 추가 사용자 행동을 담당한다.

예상 책임:

- 고객명, 메모 입력
- 환전 또는 송금 계산 결과를 거래 기록으로 저장
- `entities/transaction`의 저장 함수 호출

허용 import:

```text
features/add-transaction
→ entities/transaction
→ shared/ui
```

---

## 11.4 search-transaction

거래 기록 검색 사용자 행동을 담당한다.

예상 책임:

- 검색어 입력
- 고객명, 통화, 메모 기준 필터링
- 검색 결과를 상위 widget에 전달

허용 import:

```text
features/search-transaction
→ entities/transaction
→ shared/ui
→ shared/lib
```

---

## 12. 위젯 설계

## 12.1 calculation-panel

환전·해외송금 계산 영역을 탭으로 묶어 담당한다.

예상 구성:

- 환전/해외송금 탭 전환
- `calculate-exchange`, `calculate-remittance` 폼 (환율 로드 UI는 props로 주입)
- 거래 기록 추가(`add-transaction`) 연결

사용 가능 feature:

```text
calculate-exchange
calculate-remittance
load-exchange-rate
add-transaction
```

---

## 12.2 transaction-history-panel

거래 기록 조회 영역을 담당한다.

예상 구성:

- 검색 입력
- 거래 기록 목록
- 거래 삭제 버튼
- CSV 내보내기 버튼

사용 가능 feature:

```text
search-transaction
```

사용 가능 entity:

```text
transaction
```

---

## 13. 페이지 설계

## 13.1 dashboard page

`dashboard`는 앱의 메인 화면이다.

예상 구성:

```text
DashboardPage
├── CalculationPanel (환전·해외송금 탭)
├── TransactionHistoryPanel
└── ThemeToggleButton (features/toggle-theme, page 헤더 우측)
```

역할:

- 전체 화면 레이아웃 구성
- 각 widget 배치
- 페이지 제목과 안내 문구 표시
- 화면 단위의 여백과 반응형 레이아웃 관리

---

## 14. App 설계

`app/App.tsx`는 앱 최상위 컴포넌트다.

역할:

- 전역 레이아웃 적용
- `DashboardPage` 렌더링
- 전역 스타일 또는 기본 배경 적용

예상 구조:

```tsx
import { DashboardPage } from "@/pages/dashboard";

export function App() {
  return <DashboardPage />;
}
```

---

## 15. 상태 관리 기준

본 프로젝트는 별도 전역 상태 관리 라이브러리를 사용하지 않는다.

상태 관리 기준:

- 입력 폼 상태: 각 feature 내부 `useState`
- 복잡한 입력 상태: 필요 시 `useReducer`
- 거래 기록 상태: 상위 widget 또는 page에서 관리
- 영속 저장: `entities/transaction`의 localStorage 유틸 사용
- 계산 결과: feature 내부 상태로 관리하거나 상위 widget으로 전달

외부 상태 관리 라이브러리 사용은 기본 범위에서 제외한다.

---

## 16. 테스트 구조

테스트는 핵심 계산 로직 중심으로 작성한다.

테스트 대상:

- 환전 계산
- 해외송금 계산
- JPY·IDR 100단위 고시환율 처리 (`shared/config`의 `unit: 100`)
- 우대율 적용
- 송금수수료와 전신료 합산
- 포맷 유틸

테스트 파일은 대상 코드와 가까운 위치에 둔다.

예:

```text
src/entities/rate/model/calculateExchange.test.ts
src/entities/remittance/model/calculateRemittance.test.ts
src/shared/lib/format.test.ts
```

테스트 규칙:

- 순수 함수는 UI 없이 테스트 가능해야 한다.
- 과제에서 제공된 Sample 시나리오는 회귀 테스트로 유지한다.
- 새 계산 로직을 추가할 때는 테스트를 먼저 작성하거나 함께 작성한다.

---

## 17. TailwindCSS 사용 기준

스타일링은 TailwindCSS를 사용한다.

규칙:

- CSS 파일을 과도하게 늘리지 않는다.
- 공통 스타일은 `shared/ui` 컴포넌트로 흡수한다.
- 화면 구조는 page/widget에서 관리한다.
- 버튼, 입력창, 카드 등 반복되는 UI는 공용 컴포넌트로 분리한다.
- 모든 UI 텍스트는 한국어로 작성한다.

---

## 18. 경로 별칭 기준

가능하면 `@` 경로 별칭을 사용한다.

예:

```ts
import { DashboardPage } from "@/pages/dashboard";
import { calculateExchange } from "@/entities/rate";
import { formatKrw } from "@/shared/lib";
```

`@`는 `src` 디렉터리를 가리킨다.

설정 대상:

```text
vite.config.ts
tsconfig.app.json
```

---

## 19. 코드 배치 판단 기준

새 코드를 작성할 때 다음 기준을 따른다.

| 질문 | 배치 위치 |
|---|---|
| 앱 전체 진입점인가? | `app` |
| 페이지 단위 화면인가? | `pages` |
| 여러 기능을 조합한 화면 블록인가? | `widgets` |
| 사용자의 특정 행동인가? | `features` |
| 외환/송금/거래 기록 도메인 로직인가? | `entities` |
| 도메인과 무관한 공용 코드인가? | `shared` |

예:

| 코드 | 위치 |
|---|---|
| 환전 계산 함수 | `entities/rate` |
| 해외송금 계산 함수 | `entities/remittance` |
| 통화 설정 | `shared/config/currencies.ts` |
| 금액 포맷 함수 | `shared/lib` |
| 버튼 컴포넌트 | `shared/ui` |
| 환전 계산 입력 폼 | `features/calculate-exchange` |
| 환전·송금 통합 패널 | `widgets/calculation-panel` |
| 전체 대시보드 | `pages/dashboard` |

---

## 20. 금지 사항

다음 사항은 금지한다.

- 계산 로직을 React 컴포넌트 안에 직접 작성
- `shared`에서 `entities`, `features`, `widgets`, `pages`, `app` import
- `entities`에서 `features`, `widgets`, `pages`, `app` import
- `features`에서 `widgets`, `pages`, `app` import
- 슬라이스 내부 파일을 깊은 경로로 직접 import
- 동일 레이어의 다른 슬라이스를 직접 import
- localStorage key를 여러 파일에 하드코딩
- 실제 고객 개인정보를 테스트 데이터나 샘플 데이터에 사용
- 실제 API 키를 코드에 직접 작성

---

## 21. 완료 기준

아키텍처 관점의 완료 기준은 다음과 같다.

- `src/app`, `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared` 구조가 존재한다.
- 환전 계산 로직은 `entities/rate`에 있다.
- 해외송금 계산 로직은 `entities/remittance`에 있다.
- 통화 설정은 `shared/config/currencies.ts`에 있다.
- 환율 API 파싱·조회는 `entities/exchange-rate`에 있다.
- 거래 기록 타입과 저장 로직은 `entities/transaction`에 있다.
- 금액 포맷, CSV 유틸 등 공용 함수는 `shared/lib`에 있다.
- 공용 UI는 `shared/ui`에 있다.
- 각 슬라이스는 `index.ts`를 통해 public API를 제공한다.
- 레이어 의존 방향을 위반하지 않는다.
- 계산 로직은 Vitest로 테스트할 수 있는 순수 함수로 작성되어 있다.
