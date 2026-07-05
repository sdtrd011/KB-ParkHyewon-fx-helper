# API_PLAN: 환율 API 연동 설계

## 1. 문서 개요

### 1.1 문서 목적

본 문서는 `KB-ParkHyewon-fx-helper` 프로젝트에 실시간(일일 고시) 환율 API를 **선택 기능**으로 연동하기 위한 검토 결과와 구현 설계를 정리한다.

본 문서는 구현 전 설계 문서이며, **이 단계에서는 코드를 수정하지 않는다.**

### 1.2 관련 문서

| 문서 | 역할 |
|---|---|
| `docs/PRD.md` | 실시간 환율 API는 선택 기능, 기본은 수동 입력 |
| `docs/ARCHITECTURE.md` | `shared/api` 배치, API 키 하드코딩 금지 |
| `docs/WORKFLOW.md` | Plan → Test → Act → Reflect 흐름 |
| `.cursor/rules/00-architecture.mdc` | FSD 의존 방향 |
| `.cursor/rules/10-domain-fx.mdc` | 환율 단위·계산 규칙 |

### 1.3 설계 원칙

- API 연동 실패 시에도 **수동 입력 환전/송금 계산은 항상 동작**해야 한다.
- 계산식은 기존 `entities/rate`, `entities/remittance`를 그대로 사용한다.
- API는 **매매기준율·전신환매도율 등 입력값을 보조**하는 역할만 한다.
- API 키는 소스코드·Git 저장소에 포함하지 않는다.
- 화면 컴포넌트에서 `fetch`를 직접 작성하지 않고 `shared/api`를 통한다.

---

## 2. 후보 API 검토

### 2.1 권장: 한국수출입은행 환율 Open API (공공데이터포털)

| 항목 | 내용 |
|---|---|
| 제공 기관 | 한국수출입은행 |
| 공공데이터포털 | [한국수출입은행 환율 정보](https://www.data.go.kr/data/3068846/openapi.do) |
| API 유형 | LINK (외부 API 연계) |
| 인증 방식 | `authkey` 쿼리 파라미터 |
| 호출 방식 | REST `GET` |
| 응답 형식 | JSON (실사용 기준), 공공데이터 메타데이터에는 XML도 명시 |
| 비용 | 무료 |
| 이용 범위 | 이용허락범위 제한 없음 (공공데이터포털 기준) |

#### 최신 요청 URL (2025-06-25 이후)

```text
https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON
```

> **주의:** 기존 도메인 `www.koreaexim.go.kr`은 **2026-04-30 종료 예정**이다.  
> 신규 구현 시 반드시 `oapi.koreaexim.go.kr`을 사용한다.

#### 요청 파라미터

| 파라미터 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `authkey` | O | 공공데이터포털에서 발급한 인증키 | 발급키 |
| `searchdate` | O | 조회일자 `YYYYMMDD` | `20260704` |
| `data` | O | API 타입 코드, 환율 조회는 `AP01` | `AP01` |

#### 요청 예시

```text
GET https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey={인증키}&searchdate=20260704&data=AP01
```

#### 응답 주요 필드 (프로젝트 매핑 대상)

| API 필드 | 의미 | 본 프로젝트 활용 |
|---|---|---|
| `result` | 조회 결과 코드 (`1`: 성공 등) | 성공/실패 판별 |
| `cur_unit` | 통화 코드 (`USD`, `JPY(100)`, `EUR`, `CNH`, `IDR(100)` 등) | 통화 식별 |
| `deal_bas_r` | 매매기준율 | 환전 계산 `baseRate` 기본값 |
| `tts` | 전신환(송금) 보내실 때 | 해외송금 `telegraphicSellingRate` 기본값 |
| `ttb` | 전신환(송금) 받으실 때 | 참고용 (본 앱 기본 시나리오에서는 우선 미사용) |
| `cur_nm` | 통화명 | UI 표시 보조 |

#### 응답 예시 (발췌)

```json
[
  {
    "result": 1,
    "cur_unit": "USD",
    "deal_bas_r": "1,396.16",
    "tts": "1,410.12",
    "ttb": "1,382.20",
    "cur_nm": "미국 달러"
  },
  {
    "result": 1,
    "cur_unit": "JPY(100)",
    "deal_bas_r": "959.72",
    "tts": "969.31",
    "ttb": "950.12",
    "cur_nm": "일본 엔"
  }
]
```

#### 프로젝트 통화(8종) 매핑

| 앱 통화 | API `cur_unit` | 고시 단위 | 비고 |
|---|---|---:|---|
| USD | `USD` | 1 | `deal_bas_r` → 매매기준율 |
| JPY | `JPY(100)` | 100 | 100엔당 고시환율, `shared/config` unit 100과 일치 |
| EUR | `EUR` | 1 | |
| CNH | `CNH` | 1 | 앱 코드 CNH, API `cur_unit` CNH |
| THB | `THB` | 1 | |
| SGD | `SGD` | 1 | |
| IDR | `IDR(100)` | 100 | 100루피아당 고시환율 |
| HKD | `HKD` | 1 | |

#### 운영 주의사항

| 항목 | 내용 |
|---|---|
| 데이터 갱신 시점 | 영업일 **오전 11시 전후** 고시 (이전 요청 시 `null` 또는 빈 응답 가능) |
| 비영업일 | 주말·공휴일 데이터 없음 → 직전 영업일 조회 fallback 필요 |
| 호출 제한 | 일일 호출 제한 존재 (커뮤니티·가이드 기준 약 1,000회/일 수준, 공식 명세 재확인 필요) |
| 인증키 유효기간 | 발급 후 유효기간 있음 (통상 2년, 갱신 필요) |
| 숫자 형식 | `deal_bas_r` 등이 `"1,396.16"`처럼 **콤마 포함 문자열** → 파싱 필요 |
| 오류 코드 | `result` 값으로 인증 오류, DATA 코드 오류, 일일 제한 초과 등 구분 |

#### 공식 참고 링크

- [공공데이터포털 API 상세](https://www.data.go.kr/data/3068846/openapi.do)
- [한국수출입은행 Open API 안내](https://www.koreaexim.go.kr/ir/HPHKIR020M01?apino=2&viewtype=C&searchselect=&searchword=)

---

### 2.2 대안: 관세청 UNI-PASS 환율 API

| 항목 | 내용 |
|---|---|
| 제공 기관 | 관세청 |
| 용도 | 관세 평가용 환율 |
| 특징 | 세무·관세 목적 환율, 은행 창구 매매기준율과 값이 다를 수 있음 |
| 브라우저 직접 호출 | **CORS 제한**으로 프론트엔드 직접 호출 사례에서 문제 보고 다수 |

**본 프로젝트 권장안:** 외환 창구 도우미 목적에는 **한국수출입은행 API가 1순위**이다.  
관세청 API는 보조·비교 검토용으로만 고려한다.

---

### 2.3 대안: 상용/글로벌 환율 API

| 예시 | 특징 | 본 프로젝트 적합성 |
|---|---|---|
| ExchangeRate-API, Fixer, Open Exchange Rates 등 | USD 기준 크로스레이트, 유료 플랜 다수 | 한국 고시환율·전신환매도율과 필드 의미가 다름 |
| 한국은행 ECOS | 통계·시계열 중심 | 창구 계산 보조용으로는 매핑 작업 추가 필요 |

**결론:** 과제 범위와 PRD의 “공공 환율 API” 방향을 고려하면 **한국수출입은행 API 단일 연동**이 가장 적합하다.

---

## 3. 최신 호출 방식 및 기술 주의사항

### 3.1 호출 방식 요약

```text
1. 공공데이터포털 회원가입
2. 「한국수출입은행 환율 정보」 활용 신청
3. 일반 인증키(Decoding) 발급
4. 영업일 기준 searchdate(YYYYMMDD)와 data=AP01로 GET 요청
5. JSON 배열 응답에서 지원 통화(USD, JPY(100), EUR, CNH, THB, SGD, IDR(100), HKD) 추출
6. 콤마 제거 후 number 변환
7. 환전/송금 입력 폼에 기본값 반영
```

### 3.2 Vite 환경 변수 (context7 / Vite 8 공식 문서 기준)

Vite는 `import.meta.env`로 환경 변수를 노출한다.

| 규칙 | 내용 |
|---|---|
| 클라이언트 노출 | `VITE_` 접두사가 붙은 변수만 번들에 포함 |
| 비노출 | `VITE_` 없는 변수는 클라이언트에서 `undefined` |
| 로컬 설정 | `.env.local` 사용, Git 추적 제외 |
| 타입 | `src/vite-env.d.ts`에 `ImportMetaEnv` 확장 |

```bash
# .env.local (Git에 커밋하지 않음)
VITE_EXCHANGE_RATE_API_BASE=/api/exchange-rates
```

> **중요:** `VITE_KOREAEXIM_AUTHKEY`처럼 키를 클라이언트 env에 넣으면 **빌드 결과물에 노출**된다.  
> 한국수출입은행 API는 `authkey`를 쿼리스트링에 포함하므로, 브라우저 직접 호출 시 키 유출 위험이 크다.  
> **권장:** 인증키는 서버·프록시·서버리스 BFF에서만 주입한다.

### 3.3 숫자 파싱 주의

API 응답 숫자는 문자열이며 천 단위 콤마가 포함될 수 있다.

```text
"1,396.16" → 1396.16
```

파싱은 `shared/lib`의 숫자 유틸 또는 `entities/exchange-rate` 파서에서 처리한다.  
포맷된 문자열을 계산식에 직접 사용하지 않는다 (`.cursor/rules/10-domain-fx.mdc`).

### 3.4 JPY·IDR 단위 주의

- API: `JPY(100)`, `IDR(100)` + 100단위당 `deal_bas_r`
- 앱: `shared/config/currencies.ts`의 JPY·IDR `unit: 100`
- **추가 환산 없이** 매매기준율 값을 그대로 `baseRate` / `telegraphicSellingRate`에 넣는다.

---

## 4. CORS 검토

### 4.1 결론

**한국수출입은행 환율 API를 브라우저에서 직접 호출하면 CORS 오류가 발생할 가능성이 높다.**

| 구분 | 설명 |
|---|---|
| 원인 | 브라우저 Same-Origin Policy. 앱 출처(`localhost`, 배포 도메인)와 `oapi.koreaexim.go.kr`이 다름 |
| API 서버 동작 | 공공 Open API는 일반적으로 `Access-Control-Allow-Origin`을 프론트 도메인에 맞춰 제공하지 않음 |
| 실무 사례 | 한국수출입은행·관세청 공공 API를 React/Vite에서 직접 `fetch`할 때 CORS 차단 보고 다수 |

### 4.2 권장 호출 구조

```text
[브라우저 React 앱]
        ↓  same-origin
[Vite dev proxy 또는 BFF/API Route]
        ↓  server-to-server (CORS 무관)
[oapi.koreaexim.go.kr]
```

#### 개발 환경 (Vite proxy)

```ts
// vite.config.ts (구현 예시, 아직 적용하지 않음)
server: {
  proxy: {
    '/api/exchange-rates': {
      target: 'https://oapi.koreaexim.go.kr',
      changeOrigin: true,
      rewrite: () => '/site/program/financial/exchangeJSON',
    },
  },
}
```

- 인증키는 **프록시 미들웨어 또는 서버 환경 변수**에서만 주입
- 클라이언트는 `/api/exchange-rates?searchdate=YYYYMMDD`만 호출

#### 운영 환경 (선택)

| 방식 | 설명 |
|---|---|
| Vercel/Netlify Serverless Function | API 키를 서버 측에서만 사용 |
| Supabase Edge Function | PRD 선택 기술, 키를 Secrets에 저장 |
| 소규모 Node 프록시 | 과제·내부용 배포 시 |

### 4.3 CORS 우회만으로는 부족한 이유

프록시 없이 CORS를 우회하더라도 `authkey`가 브라우저 네트워크 탭에 노출된다.  
따라서 **CORS 해결 = 프록시/BFF 도입**, **키 보호 = 서버 측 주입**을 함께 설계한다.

---

## 5. API 키 관리 방안 (하드코딩 금지)

### 5.1 금지 사항

- 소스코드·`constants.ts`·테스트 코드에 인증키 하드코딩
- Git에 `.env.local` 커밋
- README·`docs/prompts.md`에 실제 키 기록

### 5.2 권장 방식

| 환경 | 저장 위치 | 앱 접근 방식 |
|---|---|---|
| 로컬 개발 | `.env.local`의 `KOREAEXIM_AUTHKEY` (Vite 접두사 **없음**) | Vite proxy/BFF가 읽어서 upstream 호출 |
| 팀 공유 | `.env.example`에 변수명만 문서화 | 실제 값 없음 |
| CI/CD | GitHub Actions Secrets, 배포 플랫폼 Env | 서버리스 함수에서만 사용 |
| Git | `.gitignore`에 `.env`, `.env.local` 포함 확인 | — |

#### `.env.example` (구현 시 추가 예정)

```bash
# 한국수출입은행 환율 API (서버/프록시 전용 — VITE_ 접두사 사용 금지)
KOREAEXIM_AUTHKEY=

# 클라이언트가 호출할 same-origin 경로
VITE_EXCHANGE_RATE_API_BASE=/api/exchange-rates
```

### 5.3 Vite 공식 문서 기준 보안 메모 (context7)

- `VITE_` 변수는 **클라이언트 번들에 포함**된다.
- 민감 정보에는 `VITE_` 접두사를 사용하지 않는다.
- 본 프로젝트의 인증키는 **서버 사이드 또는 dev proxy 전용 환경 변수**로 관리한다.

---

## 6. FSD 구조 설계

### 6.1 레이어별 역할

```text
features/load-exchange-rate   → 사용자 행동(환율 불러오기 버튼)
widgets/calculation-panel     → 탭 UI에 환율 로드 컴포넌트를 props로 주입
entities/exchange-rate        → API 응답 → 도메인 환율 모델 변환, 전 영업일 fallback
shared/api                    → HTTP 호출 (`exchangeRateClient.ts`)
shared/config                 → 통화 설정, URL·엔드포인트 상수 (키 제외)
```

### 6.2 추가·수정 예정 파일

```text
src/
├── shared/
│   ├── api/
│   │   ├── exchangeRateClient.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── config/
│       ├── currencies.ts
│       ├── exchangeRateApi.ts
│       └── storageKeys.ts
├── entities/
│   └── exchange-rate/
│       ├── model/
│       │   ├── loadExchangeRateQuote.ts
│       │   ├── parseKoreaEximRates.ts
│       │   └── types.ts
│       └── index.ts
└── features/
    └── load-exchange-rate/
        ├── ui/
        │   ├── LoadExchangeRateButton.tsx
        │   ├── LoadRemittanceRateButton.tsx
        │   └── RateSourceNotice.tsx
        └── index.ts
```

기존 파일 연동:

| 파일 | 변경 내용 |
|---|---|
| `features/calculate-exchange/ui/CalculateExchangeForm.tsx` | `RateLoader`/`RateNotice` props로 환율 UI 주입, `baseRate` 반영 |
| `features/calculate-remittance/ui/CalculateRemittanceForm.tsx` | 동일 패턴으로 `telegraphicSellingRate` 반영 |
| `widgets/calculation-panel/ui/CalculationPanel.tsx` | 탭·환율 로드 feature 조합 |

### 6.3 의존 방향

```text
features/load-exchange-rate
  → entities/exchange-rate
  → shared/api
  → shared/config

features/calculate-exchange
  → entities/rate
  → shared/config
  → (widget이 load-exchange-rate 컴포넌트를 props로 주입)

widgets/calculation-panel
  → features/load-exchange-rate
  → features/calculate-exchange
  → features/calculate-remittance
  → features/add-transaction
```

**금지:**

- `shared/api` → `entities` / `features` import
- `entities/exchange-rate` → `features` import
- 화면 컴포넌트 내부 `fetch('https://oapi.koreaexim.go.kr/...')` 직접 작성

### 6.4 Public API 예시

```ts
// shared/api
export { fetchKoreaEximExchangeRates } from './exchangeRateClient'

// entities/exchange-rate
export { parseKoreaEximRates } from './model/parseKoreaEximRates'
export type { ExchangeRateQuote, ExchangeRateQuoteMap } from './model/types'

// features/load-exchange-rate
export { LoadExchangeRateButton, LoadRemittanceRateButton, RateSourceNotice } from './ui/...'
export { loadExchangeRateQuote } from '@/entities/exchange-rate'
```

### 6.5 도메인 타입 초안

```ts
export interface ExchangeRateQuote {
  currencyCode: CurrencyCode  // shared/config 기준 8종
  baseRate: number
  telegraphicSellingRate: number
  quotedAt: string
  source: 'KOREAEXIM'
}
```

> 실제 구현 타입은 `entities/exchange-rate/model/types.ts`를 참고한다.

---

## 7. Fallback(실패 대응) 설계

### 7.1 기본 원칙

> **API는 입력 보조 수단이며, 계산 기능의 필수 조건이 아니다.** (PRD 13장 유의사항)

### 7.2 UI 동작

| 상황 | 동작 |
|---|---|
| API 미설정 (키 없음) | "환율 불러오기" 비활성 또는 숨김, 수동 입력만 제공 |
| API 호출 성공 | 선택 통화의 `매매기준율`·`전신환매도율` 입력란 자동 채움 |
| API 호출 실패 | 한국어 오류 메시지 표시, **기존 입력값 유지**, 계산 버튼 정상 동작 |
| 부분 성공 (일부 통화만 누락) | 조회된 통화만 채움, 누락 통화는 안내 후 수동 입력 |
| 비영업일·11시 이전 | 직전 영업일 재조회 1회 시도 → 실패 시 수동 입력 안내 |

### 7.3 오류 메시지 예시

| 조건 | 사용자 메시지 |
|---|---|
| 네트워크 오류 | 환율 정보를 불러오지 못했습니다. 매매기준율을 직접 입력해주세요. |
| 인증 오류 | 환율 API 인증에 실패했습니다. 관리자에게 API 키 설정을 확인해주세요. |
| 데이터 없음 | 오늘 고시 환율이 아직 없습니다. 직접 입력하거나 잠시 후 다시 시도해주세요. |
| 일일 호출 초과 | 환율 API 호출 한도를 초과했습니다. 직접 입력해주세요. |

### 7.4 상태 흐름

```text
[초기] 수동 입력 가능
   ↓ 사용자 "환율 불러오기" 클릭
[로딩] 버튼 비활성 + 로딩 표시
   ↓
성공 → 입력란 갱신 + "○○ 기준 환율을 반영했습니다" (선택)
실패 → 오류 배너 + 입력란 변경 없음
   ↓
[계산하기] 기존 calculateExchange / calculateRemittance 그대로 실행
```

### 7.5 캐시 (선택)

- `sessionStorage`에 당일 조회 결과 저장 → 탭 새로고침 시 재호출 최소화
- 키 예: `kb-fx-helper:exchange-rate-cache`
- 캐시 실패 시에도 수동 입력으로 fallback

---

## 8. 구현 순서 제안 (WORKFLOW 기준)

```text
Phase 1. Plan   ← 본 문서 (완료)
Phase 1.5 Test
  - parseKoreaEximRates 단위 테스트 (JPY(100), 콤마 파싱, 누락 통화)
Phase 2. Act
  1. shared/config, shared/api 클라이언트
  2. entities/exchange-rate 파서
  3. Vite dev proxy 설정
  4. features/load-exchange-rate
  5. calculate-exchange / calculate-remittance 입력 연동
  6. .env.example, README 환율 API 섹션
Phase 3. Reflect
  - docs/prompts.md, REPORT.md 반영
```

---

## 9. 리스크 및 미해결 항목

| 항목 | 내용 | 대응 |
|---|---|---|
| CORS | 브라우저 직접 호출 불가 가능성 높음 | Vite proxy / BFF 필수 검토 |
| API 키 노출 | 쿼리스트링 인증 | 서버 측 주입 |
| 고시 시점 | 11시 이전·휴일 빈 응답 | 직전 영업일 fallback |
| 실시간성 | 분 단위 실시간 아님, 일일 고시 | UI에 "○월 ○일 고시 환율" 표시 |
| 창구 환율 차이 | API 고시환율 ≠ 실제 창구 적용환율 | "참고용" 안내 문구 유지 |
| 호출 제한 | 일일 제한 존재 | 캐시·버튼 연타 방지 |

---

## 10. 완료 기준 (구현 단계용)

- [x] `shared/api`를 통해서만 외부 환율 API 호출
- [x] API 키가 Git에 포함되지 않음
- [x] 8종 통화(USD, JPY, EUR, CNH, THB, SGD, IDR, HKD) 매매기준율·전신환매도율 불러오기 가능
- [x] JPY·IDR 100단위 환율이 기존 계산 로직과 일치
- [x] API 실패 시 수동 입력·계산 정상 동작
- [x] 기존 Vitest 계산 시나리오 테스트 유지 통과
- [x] `npm run build` 성공

---

## 11. 참고 자료

- [공공데이터포털 - 한국수출입은행 환율 정보](https://www.data.go.kr/data/3068846/openapi.do)
- [한국수출입은행 Open API 안내](https://www.koreaexim.go.kr/ir/HPHKIR020M01?apino=2&viewtype=C&searchselect=&searchword=)
- [Vite 8 - Env Variables and Modes](https://github.com/vitejs/vite/blob/v8.0.10/docs/guide/env-and-mode.md) (context7 조회)
- 프로젝트 내부: `docs/ARCHITECTURE.md` §10.4 `shared/api`
