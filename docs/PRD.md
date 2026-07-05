# PRD: KB 외환 창구 도우미

## 1. 문서 개요

### 1.1 문서 목적

본 문서는 `KB-ParkHyewon-fx-helper` 프로젝트의 요구사항을 정의하기 위한 문서이다.

이 프로젝트는 은행 외환 창구 직원이 반복적으로 수행하는 환전 금액 계산, 해외송금 비용 계산, 거래 기록 관리 업무를 보조하는 웹앱을 구현하는 것을 목표로 한다.

이번 프로젝트는 단순히 동작하는 화면을 만드는 것뿐 아니라, 여러 사람이 함께 유지보수할 수 있도록 FSD 구조, Cursor Rules, Workflow 문서를 함께 구성하는 것을 중요하게 본다.

### 1.2 프로젝트명

- 프로젝트 폴더명: `KB-ParkHyewon-fx-helper`
- package name: `kb-parkhyewon-fx-helper`
- 앱 표시명: `KB 외환 창구 도우미`

### 1.3 개발 범위

본 프로젝트는 React 기반 프론트엔드 단독 웹앱으로 구현한다.

기본 데이터 저장은 브라우저 `localStorage`를 사용한다. 실제 은행 시스템, 실제 환율 서버, 고객 정보 시스템, 계정계 시스템과는 연동하지 않는다.

---

## 2. 프로젝트 배경 및 목표

### 2.1 프로젝트 배경

은행 외환 창구 직원은 매일 환전 계산과 거래 기록 업무를 반복한다.

환전 계산에는 매매기준율, 현찰 살 때/팔 때 구분, 스프레드, 우대율, 통화별 고시 단위가 함께 사용되므로 수작업 계산이 번거롭다.

특히 JPY처럼 100엔당 고시환율을 사용하는 통화는 단위 처리 실수가 발생하기 쉽다. 또한 거래 내용을 별도 문서나 메모로 관리하면 검색과 재확인이 불편하다.

따라서 외환 창구 직원이 환전 계산, 해외송금 비용 계산, 거래 기록 조회를 한 화면에서 처리할 수 있는 보조 웹앱을 만든다.

### 2.2 프로젝트 목표

- React 19 + Vite + TypeScript + TailwindCSS 기반의 외환 창구 도우미 웹앱 구현
- 환전 계산기 기능 구현
- 해외송금 비용 계산기 기능 구현
- 거래 기록 추가, 삭제, 검색 기능 구현
- 거래 기록을 브라우저 `localStorage`에 저장
- FSD 구조를 적용하여 레이어별 역할과 의존 방향을 명확히 구분
- Cursor Rules와 Workflow 문서를 작성하여 AI 협업 방식을 표준화
- Vitest를 활용하여 핵심 계산 로직 검증

---

## 3. 사용자

### 3.1 주요 사용자

- 은행 외환 창구 직원
- 외환 상담 담당자
- 환전 및 송금 업무를 보조해야 하는 내부 사용자

### 3.2 사용자 니즈

- 통화, 환율, 우대율을 입력하면 적용환율과 원화 금액을 빠르게 계산하고 싶다.
- JPY처럼 고시 단위가 다른 통화도 실수 없이 계산하고 싶다.
- 고객의 환전 또는 송금 상담 내용을 간단히 기록하고 싶다.
- 기록된 거래를 고객명, 통화, 메모 기준으로 검색하고 싶다.
- 계산 결과와 거래 기록을 브라우저에서 계속 유지하고 싶다.
- 계산 로직이 화면 코드와 분리되어 유지보수하기 쉬웠으면 한다.

---

## 4. 기술 요구사항

### 4.1 필수 기술 스택

| 구분 | 사용 기술 |
|---|---|
| UI 라이브러리 | React 19 |
| DOM 렌더링 | React DOM |
| 언어 | TypeScript |
| 빌드 도구 | Vite |
| 스타일링 | TailwindCSS |

### 4.2 활용 기술

- 언어/프레임워크: React 19 + TypeScript + Vite
- 스타일링: TailwindCSS
- 상태 관리: React `useState`, 필요 시 `useReducer`
- 데이터 저장: 브라우저 `localStorage`
- 테스트: Vitest
- 아키텍처: FSD
- 선택 저장소: Supabase
- AI 개발 도구: Cursor
- 선택 도구:
  - CodeRabbit
  - MCP 설정
  - Custom Mode

### 4.3 제외 범위

이번 프로젝트에서는 다음 항목을 기본 구현 범위에서 제외한다.

- 실제 은행 환율 서버 연동
- 실제 고객 정보 저장
- 로그인 및 권한 관리
- 실거래 처리
- 계정계 또는 외부 시스템 연동
- 실제 수수료 체계 전체 반영
- Supabase, Vercel 배포는 선택 사항으로만 고려

---

## 5. 전체 기능 구성

본 프로젝트는 한 화면 대시보드 형태로 구성한다.

주요 기능은 다음과 같다.

1. 환전 계산기
2. 해외송금 비용 계산기
3. 거래 기록 관리
4. 거래 기록 검색
5. 거래 기록 CSV 내보내기
6. 계산 로직 테스트

---

## 6. 필수 기능 요구사항

## 6.1 환전 계산기

### 6.1.1 기능 개요

사용자가 통화, 매매기준율, 거래 구분, 우대율, 금액을 입력하면 적용환율과 고객이 지불하거나 수령하는 원화 금액을 계산한다.

### 6.1.2 입력 항목

| 항목 | 설명 | 예시 |
|---|---|---|
| 통화 | 환전 대상 통화 | USD, JPY, EUR, CNH, THB, SGD, IDR, HKD |
| 매매기준율 | 기준이 되는 고시환율 | 1,380.50 |
| 거래 구분 | 현찰 살 때 또는 현찰 팔 때 | 현찰 살 때 |
| 스프레드율 | 통화별 또는 거래별 스프레드율 | 1.75% |
| 우대율 | 고객에게 적용할 환율 우대율 | 50% |
| 외화 금액 | 환전할 외화 금액 | 1,000 |

### 6.1.3 거래 구분 정의

| 거래 구분 | 의미 | 결과 |
|---|---|---|
| 현찰 살 때 | 고객이 외화를 사는 경우 | 고객이 원화를 지불 |
| 현찰 팔 때 | 고객이 외화를 파는 경우 | 고객이 원화를 수령 |

### 6.1.4 적용환율 계산식

현찰 살 때 적용환율은 다음과 같다.

```text
적용환율 = 매매기준율 × (1 + 스프레드율 × (1 - 우대율))
```

현찰 팔 때 적용환율은 다음과 같다.

```text
적용환율 = 매매기준율 × (1 - 스프레드율 × (1 - 우대율))
```

계산 시 비율 값은 다음과 같이 처리한다.

```text
스프레드율 1.75% → 0.0175
우대율 50% → 0.5
```

### 6.1.5 원화 금액 계산식

```text
원화 금액 = 반올림(외화 금액 ÷ 통화 단위 × 적용환율)
```

적용환율은 먼저 소수점 2자리로 반올림한 뒤 원화 금액 계산에 사용한다.

### 6.1.6 통화별 단위 처리

| 통화 | 고시 단위 | 계산 단위 |
|---|---:|---:|
| USD, EUR, CNH, THB, SGD, HKD | 1단위당 | 1 |
| JPY | 100엔당 | 100 |
| IDR | 100루피아당 | 100 |

JPY·IDR은 100단위 고시환율 기준으로 계산한다.

예:

```text
외화 금액: 100,000 JPY
통화 단위: 100
적용환율: 950.00
원화 금액 = 100,000 ÷ 100 × 950.00 = 950,000원
```

### 6.1.7 출력 항목

| 항목 | 설명 |
|---|---|
| 적용환율 | 우대율과 스프레드가 반영된 환율 |
| 원화 금액 | 고객이 지불하거나 수령하는 원화 금액 |
| 거래 구분 | 현찰 살 때 또는 현찰 팔 때 |
| 우대율 | 적용된 우대율 |
| 통화 단위 | 해당 통화의 고시 단위 |

### 6.1.8 표시 규칙

- 적용환율은 소수점 2자리까지 표시한다.
- 원화 금액은 정수 원 단위로 표시한다.
- 원화 금액은 천 단위 콤마와 `원` 단위를 함께 표시한다.
  - 예: `1,380,500원`
- 우대율은 `%` 단위로 표시한다.

### 6.1.9 입력값 검증

다음 조건에 해당하면 계산하지 않고 오류 메시지를 표시한다.

| 조건 | 오류 메시지 |
|---|---|
| 통화 미선택 | 통화를 선택해주세요. |
| 매매기준율 빈 값 | 매매기준율을 입력해주세요. |
| 매매기준율 0 이하 | 매매기준율은 0보다 커야 합니다. |
| 스프레드율 빈 값 | 스프레드율을 입력해주세요. |
| 스프레드율 0 미만 또는 100 초과 | 스프레드율은 0% 이상 100% 이하로 입력해주세요. |
| 우대율 빈 값 | 우대율을 입력해주세요. |
| 우대율 0 미만 또는 100 초과 | 우대율은 0% 이상 100% 이하로 입력해주세요. |
| 금액 빈 값 | 외화 금액을 입력해주세요. |
| 금액 0 이하 | 외화 금액은 0보다 커야 합니다. |
| 숫자가 아닌 값 | 숫자만 입력해주세요. |

---

## 6.2 거래 기록 관리

### 6.2.1 기능 개요

환전 또는 상담 거래 내용을 기록하고, 브라우저 `localStorage`에 저장한다. 새로고침 후에도 거래 기록이 유지되어야 한다.

### 6.2.2 입력 항목

| 항목 | 설명 | 필수 여부 |
|---|---|---|
| 고객명 | 고객 이름 또는 임시 식별명 | 필수 |
| 통화 | 거래 통화 | 필수 |
| 거래 구분 | 현찰 살 때, 현찰 팔 때, 해외송금 등 | 필수 |
| 외화 금액 | 거래 외화 금액 | 필수 |
| 적용환율 | 계산된 적용환율 | 필수 |
| 원화 금액 | 계산된 원화 금액 | 필수 |
| 우대율 | 적용 우대율 | 선택 |
| 메모 | 상담 내용 또는 참고사항 | 선택 |
| 거래 일시 | 거래 기록 생성 시각 | 자동 |

### 6.2.3 주요 기능

| 기능 | 설명 |
|---|---|
| 기록 추가 | 계산 결과 또는 사용자가 입력한 거래 내용을 저장 |
| 기록 삭제 | 개별 거래 기록 삭제 |
| 키워드 검색 | 고객명, 통화, 메모 기준 검색 |
| 거래 유지 | localStorage 저장으로 새로고침 후에도 기록 유지 |
| 빈 상태 표시 | 기록이 없을 때 안내 문구 표시 |
| 검색 결과 없음 표시 | 검색 조건에 맞는 기록이 없을 때 안내 문구 표시 |

### 6.2.4 localStorage 저장 정책

거래 기록은 브라우저 `localStorage`에 저장한다.

localStorage key:

```text
kb-fx-helper:transactions
```

저장 로직은 컴포넌트에서 직접 처리하지 않고, `shared/lib` 또는 `entities/transaction`의 저장 유틸을 통해 처리한다.

### 6.2.5 개인정보 유의사항

거래 기록에는 실제 주민등록번호, 계좌번호, 주소, 고객번호 등 민감정보를 입력하지 않도록 안내 문구를 표시한다.

안내 문구:

```text
실제 주민등록번호, 계좌번호, 주소 등 민감한 개인정보는 입력하지 마세요. 본 기록은 현재 브라우저의 localStorage에만 저장됩니다.
```

---

## 6.3 사용자 인터페이스

### 6.3.1 화면 구성

앱은 한 화면 대시보드 형태로 구성한다.

권장 탭 구성:

1. 환전 계산
2. 해외송금 계산
3. 거래 기록

또는 한 화면에서 환전 계산 패널과 거래 기록 패널을 함께 배치할 수 있다.

### 6.3.2 기본 UI 요구사항

- React 19 + Vite + TypeScript + TailwindCSS 기반으로 구현한다.
- 모든 UI 텍스트는 한국어로 작성한다.
- 입력 영역과 결과 영역을 명확히 분리한다.
- 계산 결과는 카드 형태로 표시한다.
- 거래 기록은 표 또는 카드 목록 형태로 표시한다.
- 디자인 완성도보다 기능 구현과 아키텍처 준수를 우선한다.
- 공용 버튼, 입력창, 선택 컴포넌트는 `shared/ui`에서 관리한다.

---

## 7. 고급 기능 요구사항

## 7.1 해외송금 비용 계산기

### 7.1.1 기능 개요

사용자가 통화, 송금 외화 금액, 전신환매도율, 스프레드율, 우대율을 입력하면 해외송금 시 필요한 총 원화 비용을 계산한다. 송금수수료는 USD 상당액 구간표에 따라 자동 산정한다.

### 7.1.2 입력 항목

| 항목 | 설명 | 예시 |
|---|---|---|
| 통화 | 송금 통화 | USD, JPY, EUR, CNH, THB, SGD, IDR, HKD |
| 송금 외화 금액 | 송금할 외화 금액 | 1,000 |
| 전신환매도율 | 송금 계산에 적용되는 환율 | 1,375.20 |
| 전신환 스프레드율 | 전신환 계산 시 적용할 스프레드율 | 1.0% |
| 우대율 | 전신환 스프레드에 적용할 우대율 | 30% |

송금수수료·전신료는 구간표·고정값으로 자동 계산한다. (전신료 8,000원)

### 7.1.3 계산식

전신환 적용환율은 다음과 같다.

```text
전신환 적용환율 = 전신환매도율 × (1 + 전신환 스프레드율 × (1 - 우대율))
```

원화 환산 금액은 다음과 같다.

```text
원화 환산 금액 = 반올림(송금 외화 금액 ÷ 통화 단위 × 전신환 적용환율)
USD 상당액 = 원화 환산 금액 ÷ USD 매매기준율
송금수수료 = USD 상당액 구간별 수수료 (README 수수료표 참고)
```

총 송금 비용은 다음과 같다.

```text
총 송금 비용 = 원화 환산 금액 + 송금수수료 + 전신료
```

> 송금수수료는 **선택 통화 금액 숫자가 아니라 USD 상당액** 기준이다.  
> USD 매매기준율은 환율 API의 USD `deal_bas_r`을 사용하고, 미사용·실패 시 **1,550원** 고정값을 적용한다.

### 7.1.4 JPY·IDR 처리

JPY·IDR은 100단위 고시환율 기준으로 계산한다.

```text
원화 환산 금액 = 송금 외화 금액 ÷ 100 × 전신환 적용환율
```

### 7.1.5 출력 항목

| 항목 | 설명 |
|---|---|
| 전신환 적용환율 | 우대율과 전신환 스프레드가 반영된 환율 |
| 원화 환산 금액 | 송금 외화 금액을 원화로 환산한 금액 |
| 송금수수료 | 입력된 송금수수료 |
| 전신료 | 입력된 전신료 |
| 총 송금 비용 | 원화 환산 금액 + 송금수수료 + 전신료 |

### 7.1.6 입력값 검증

| 조건 | 오류 메시지 |
|---|---|
| 통화 미선택 | 통화를 선택해주세요. |
| 송금 외화 금액 빈 값 | 송금 외화 금액을 입력해주세요. |
| 송금 외화 금액 0 이하 | 송금 외화 금액은 0보다 커야 합니다. |
| 전신환매도율 빈 값 | 전신환매도율을 입력해주세요. |
| 전신환매도율 0 이하 | 전신환매도율은 0보다 커야 합니다. |
| 전신환 스프레드율 음수 | 전신환 스프레드율은 0% 이상이어야 합니다. |
| 우대율 0 미만 또는 100 초과 | 우대율은 0% 이상 100% 이하로 입력해주세요. |
| 송금수수료 음수 | 송금수수료는 0원 이상이어야 합니다. |
| 전신료 음수 | 전신료는 0원 이상이어야 합니다. |

---

## 7.2 거래 기록 CSV 내보내기

### 7.2.1 기능 개요

저장된 거래 기록을 CSV 파일로 다운로드할 수 있다.

### 7.2.2 CSV 컬럼

| 컬럼 | 설명 |
|---|---|
| 거래일시 | 거래 기록 생성 시각 |
| 고객명 | 고객명 또는 임시 식별명 |
| 거래구분 | 현찰 살 때, 현찰 팔 때, 해외송금 |
| 통화 | 거래 통화 |
| 외화금액 | 거래 외화 금액 |
| 적용환율 | 적용된 환율 |
| 원화금액 | 지불/수령/송금 원화 금액 |
| 우대율 | 적용 우대율 |
| 메모 | 거래 메모 |

### 7.2.3 처리 규칙

- 파일명은 `fx-transactions.csv`로 한다.
- CSV 첫 줄에는 헤더를 포함한다.
- Excel에서 한글이 깨지지 않도록 UTF-8 BOM을 추가한다.
- 금액은 CSV 내부에서 숫자 값으로 저장한다.
- 화면 상태는 다운로드 후에도 변경되지 않는다.

---

## 7.3 Vitest 테스트

### 7.3.1 기능 개요

환전 계산과 해외송금 계산의 핵심 로직은 Vitest로 검증한다.

### 7.3.2 테스트 대상

- 현찰 살 때 적용환율 계산
- 현찰 팔 때 적용환율 계산
- 우대율 0%, 50%, 100% 케이스
- JPY 100엔 단위 계산
- 해외송금 총 비용 계산
- 송금수수료와 전신료 합산
- 잘못된 입력값 처리

### 7.3.3 테스트 파일 위치

테스트 파일은 계산 로직과 가까운 위치에 둔다.

예:

```text
src/entities/rate/model/calculateExchange.test.ts
src/entities/remittance/model/calculateRemittance.test.ts
```

---

## 7.4 MCP 설정

### 7.4.1 기능 개요

팀 공용 MCP 설정을 `.cursor/mcp.json`에 작성한다.

### 7.4.2 목적

- 팀 단위로 공통 도구 설정을 공유한다.
- context7 등 문서 조회 도구를 사용할 수 있는 구조를 마련한다.
- 실제 사용 여부와 관계없이 AI 협업 환경 표준화 경험을 문서화한다.

---

## 7.5 CodeRabbit 설정

### 7.5.1 기능 개요

CodeRabbit 코드리뷰 환경 구성을 위해 `.coderabbit.yaml` 파일을 작성한다.

### 7.5.2 목적

- 기능 단위 PR 리뷰 흐름을 문서화한다.
- AI 코드리뷰를 활용한 협업 방식을 경험한다.
- 아키텍처 위반, 테스트 부족, 가독성 문제를 리뷰 대상으로 삼는다.

---

## 8. FSD 아키텍처 요구사항

본 프로젝트는 중간과제의 `src/components` + `src/lib` 중심 단순 구조가 아니라, Context의 범위를 제한하는 FSD 구조를 적용한다.

기능이 늘어나도 팀이 함께 유지보수할 수 있도록 코드를 레이어와 슬라이스 단위로 분리한다.

```text
src/
├── app/
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
```

### 8.1 레이어 역할

| 레이어 | 역할 | 외환 도우미 예시 |
|---|---|---|
| app | 전역 설정, 프로바이더, 진입 조립 | App.tsx, 전역 스타일 |
| pages | 라우트 단위 화면 | dashboard |
| widgets | 페이지를 구성하는 독립 UI 블록 | calculation-panel, transaction-history-panel |
| features | 사용자 행동 또는 시나리오 단위 기능 | calculate-exchange, calculate-remittance, load-exchange-rate, add-transaction, search-transaction, toggle-theme |
| entities | 비즈니스 엔티티, 모델, 도메인 로직 | rate, remittance, transaction, exchange-rate |
| shared | 어디서나 쓰는 공용 코드 | lib, ui, config (currencies, storageKeys), api |

### 8.2 의존 방향

상위 레이어는 하위 레이어만 import할 수 있다.

```text
app → pages → widgets → features → entities → shared
```

금지 사항:

- 하위 레이어가 상위 레이어를 import하는 것 금지
- 동일 레이어의 서로 다른 슬라이스 간 직접 import 금지
- 슬라이스 내부 파일을 깊은 경로로 직접 import 금지
- 외부 공개는 각 슬라이스의 `index.ts` public API를 통해서만 수행

---

## 9. 데이터 타입

## 9.1 통화 타입

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

> 통화 설정은 `shared/config/currencies.ts`에 정의한다.

## 9.2 환전 계산 입력 타입

```ts
export type ExchangeTransactionType = "CASH_BUY" | "CASH_SELL";

export interface ExchangeCalculationInput {
  currencyCode: CurrencyCode;
  baseRate: number;
  spreadRate: number;
  preferentialRate: number;
  foreignAmount: number;
  transactionType: ExchangeTransactionType;
}
```

## 9.3 환전 계산 결과 타입

```ts
export interface ExchangeCalculationResult {
  currencyCode: CurrencyCode;
  transactionType: ExchangeTransactionType;
  appliedRate: number;
  krwAmount: number;
  currencyUnit: number;
}
```

## 9.4 해외송금 계산 입력 타입

```ts
export interface RemittanceCalculationInput {
  currencyCode: CurrencyCode;
  telegraphicSellingRate: number;
  telegraphicSpreadRate: number;
  preferentialRate: number;
  foreignAmount: number;
  remittanceFee: number;
  cableFee: number;
}
```

## 9.5 해외송금 계산 결과 타입

```ts
export interface RemittanceCalculationResult {
  currencyCode: CurrencyCode;
  appliedRate: number;
  convertedKrwAmount: number;
  remittanceFee: number;
  cableFee: number;
  totalKrwCost: number;
  currencyUnit: number;
}
```

## 9.6 거래 기록 타입

```ts
export type TransactionKind = "EXCHANGE" | "REMITTANCE";

export interface FxTransaction {
  id: string;
  kind: TransactionKind;
  customerName: string;
  currencyCode: CurrencyCode;
  transactionLabel: string;
  foreignAmount: number;
  appliedRate: number;
  krwAmount: number;
  preferentialRate?: number;
  memo?: string;
  createdAt: string;
}
```

---

## 10. 프로젝트 구조

본 프로젝트는 다음 구조를 기준으로 한다.

```text
KB-ParkHyewon-fx-helper/
├── README.md
├── .cursor/
│   ├── mcp.json
│   └── rules/
│       ├── 00-architecture.mdc
│       ├── 10-domain-fx.mdc
│       ├── 20-ui.mdc
│       └── 30-testing.mdc
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── WORKFLOW.md
│   └── prompts.md
├── .coderabbit.yaml
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── src/
    ├── app/
    │   └── App.tsx
    ├── pages/
    │   └── dashboard/
    ├── widgets/
    │   ├── calculation-panel/
    │   └── transaction-history-panel/
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
        ├── lib/
        ├── ui/
        ├── config/
        │   └── currencies.ts
        └── api/
        ├── ui/
        ├── config/
        └── api/
```

---

## 11. 구현 범위

### 11.1 기본 구현 범위

- 환전 계산기
- 거래 기록 추가
- 거래 기록 삭제
- 거래 기록 검색
- 거래 기록 localStorage 저장
- 대시보드 UI
- FSD 구조 적용
- Cursor Rules 작성
- Workflow 문서 작성
- Architecture 문서 작성

### 11.2 고급 구현 범위

- 해외송금 비용 계산기
- 거래 기록 CSV 내보내기
- Vitest 테스트 코드
- MCP 설정 파일 작성
- CodeRabbit 설정 파일 작성
- Custom Mode 활용 기록

구체적인 작업 순서는 `docs/WORKFLOW.md`에서 관리한다.

---

## 12. 완료 기준

### 12.1 기능 완료 기준

- `npm run dev`로 앱이 정상 실행된다.
- 환전 계산기에서 적용환율과 원화 금액이 계산된다.
- JPY는 100엔당 고시환율 기준으로 계산된다.
- 현찰 살 때와 현찰 팔 때 계산식이 구분된다.
- 우대율이 적용환율에 반영된다.
- 해외송금 비용 계산기가 동작한다.
- 거래 기록을 추가할 수 있다.
- 거래 기록을 삭제할 수 있다.
- 거래 기록을 고객명, 통화, 메모 기준으로 검색할 수 있다.
- 거래 기록이 새로고침 후에도 유지된다.
- 거래 기록을 CSV로 내보낼 수 있다.

### 12.2 아키텍처 완료 기준

- FSD 구조를 따른다.
- 레이어별 역할이 `docs/ARCHITECTURE.md`에 정리되어 있다.
- 레이어 간 의존 방향이 문서와 Rules에 명시되어 있다.
- 각 슬라이스는 `index.ts` public API를 통해 외부에 노출된다.
- 계산 로직은 UI 컴포넌트와 분리되어 있다.

### 12.3 AI 협업 완료 기준

- `.cursor/rules`에 역할별 Rule 파일이 작성되어 있다.
- `docs/WORKFLOW.md`에 표준 작업 흐름이 작성되어 있다.
- `docs/prompts.md`에 주요 프롬프트가 기록되어 있다.
- `.cursor/mcp.json`이 작성되어 있다.
- `.coderabbit.yaml`이 작성되어 있다.
- REPORT.md에 Cursor Rules, Workflow, 고급 기능 구현 내용이 정리되어 있다.

### 12.4 테스트 완료 기준

- Vitest 테스트가 작성되어 있다.
- 환전 계산 로직 테스트가 통과한다.
- 해외송금 계산 로직 테스트가 통과한다.
- JPY 100엔 단위 계산 테스트가 통과한다.
- 우대율 0%, 50%, 100% 케이스가 테스트에 포함된다.
- `npm run build`가 성공한다.

---

## 13. 유의사항

- 본 앱은 학습 및 과제 제출용 웹앱이다.
- 계산 결과는 실제 은행 환율, 수수료, 내부 정책과 다를 수 있다.
- 실제 고객 개인정보를 입력하지 않는다.
- localStorage는 보안 저장소가 아니므로 민감정보 저장에 사용하지 않는다.
- 실시간 환율 API는 선택 기능이며, 기본 구현에서는 사용자가 환율을 직접 입력한다.
- 외부 시스템 연동 없이 브라우저 단독 실행을 기준으로 한다.
