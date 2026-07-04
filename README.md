# KB 외환 창구 도우미

KB 외환 창구 업무를 보조하는 웹 애플리케이션입니다. 환전 계산, 해외송금 비용 계산, 거래 기록 관리를 한 화면에서 처리할 수 있습니다.

> **본 프로젝트는 학습·과제용으로 제작되었으며, 실제 KB국민은행 또는 금융기관의 운영 시스템과 무관합니다.**  
> 화면에 표시되는 환율·수수료·계산 결과는 참고용이며, 실제 창구 거래 기준이 아닙니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **환전 계산** | 통화·매매기준율·스프레드율·우대율·외화 금액을 입력해 적용환율과 원화 금액을 계산합니다. |
| **해외송금 계산** | 전신환매도율·스프레드율·우대율·송금 외화 금액을 기준으로 원화 환산액과 총 출금액을 계산합니다. |
| **환율 API 불러오기** | 한국수출입은행 환율 API에서 매매기준율·전신환매도율을 불러와 입력값에 채웁니다. |
| **전 영업일 fallback** | 오늘(휴일·고시 전 등) 환율 데이터가 없으면 최대 7일 전까지 과거 날짜를 조회해 가장 가까운 전 영업일 환율을 사용합니다. |
| **거래 기록 관리** | 계산 결과를 고객명·메모와 함께 저장하고, 검색·삭제할 수 있습니다. |
| **CSV보내기** | 저장된 거래 기록을 `fx-transactions.csv` 파일로보냅니다. |
| **localStorage 저장** | 거래 기록은 브라우저 `localStorage`에 저장되어 새로고침 후에도 유지됩니다. |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| UI | React 19, TypeScript |
| 빌드 | Vite |
| 스타일 | TailwindCSS |
| 테스트 | Vitest |
| 데이터 저장 | 브라우저 `localStorage` |
| 아키텍처 | FSD (Feature-Sliced Design) |
| AI 협업 | Cursor, Cursor Rules |
| 문서 조회 MCP | Context7 MCP |
| 코드 리뷰 | CodeRabbit (`.coderabbit.yaml`) |

---

## 실행 방법

### 사전 요구사항

- Node.js 18 이상 권장
- npm

### 설치 및 실행

```bash
npm install
npm run dev
```

개발 서버 실행 후 브라우저에서 표시되는 주소(기본 `http://localhost:5173`)로 접속합니다.

### 테스트 및 빌드

```bash
npm run test
npm run build
```

Windows PowerShell·CMD 환경에서는 아래처럼 `npm.cmd`를 사용할 수도 있습니다.

```bash
npm.cmd install
npm.cmd run dev
npm.cmd run test
npm.cmd run build
```

---

## 환경변수 설정

환율 API 불러오기 기능을 사용하려면 프로젝트 루트에 `.env` 파일을 생성하고 API 키를 설정합니다.

```env
VITE_EXCHANGE_API_KEY=your_api_key_here
```

`.env.example` 파일을 참고할 수 있습니다.

### API 키 발급 방법

1. [공공데이터포털](https://www.data.go.kr/)에서 **한국수출입은행 환율 정보** API를 활용신청합니다.
2. 발급받은 인증키를 `VITE_EXCHANGE_API_KEY`에 입력합니다.
3. 개발 환경(`npm run dev`)에서는 Vite 프록시를 통해 API 키가 서버 측에서 주입됩니다.

### 보안 주의

- `.env` 파일은 **Git에 커밋하지 마세요.** (`.gitignore`에 포함되어 있습니다.)
- API 키를 소스코드·README·이슈·PR 본문에 직접 작성하지 마세요.

---

## 지원 통화

| 코드 | 통화명 | 고시 단위 |
|------|--------|-----------|
| USD | 미국 달러 | 1달러당 |
| EUR | 유로 | 1유로당 |
| CNH | 중국 위안 | 1위안당 |
| THB | 태국 바트 | 1바트당 |
| SGD | 싱가포르 달러 | 1달러당 |
| HKD | 홍콩 달러 | 1달러당 |
| **JPY** | 일본 엔 | **100엔당** |
| **IDR** | 인도네시아 루피아 | **100루피아당** |

> **JPY**와 **IDR**은 100단위 고시환율 기준입니다.  
> 예: JPY 외화 금액 100,000엔, 적용환율 997.15원이면  
> 원화 금액 = 100,000 ÷ 100 × 997.15 = 997,150원

---

## 계산 기준

입력되는 스프레드율·우대율은 **% 단위**입니다. (예: 1.75% → 내부 계산 시 0.0175로 변환)

### 환전 계산

**현찰 살 때 (고객이 외화를 살 때)**

```text
적용환율 = 매매기준율 × (1 + 스프레드율 × (1 - 우대율))
원화 금액 = 반올림(외화 금액 ÷ 통화 단위 × 적용환율)
```

**현찰 팔 때 (고객이 외화를 팔 때)**

```text
적용환율 = 매매기준율 × (1 - 스프레드율 × (1 - 우대율))
원화 금액 = 반올림(외화 금액 ÷ 통화 단위 × 적용환율)
```

### 해외송금 계산

```text
전신환 적용환율 = 전신환매도율 × (1 + 전신환 스프레드율 × (1 - 우대율))
원화 환산 송금원금 = 반올림(송금 외화 금액 ÷ 통화 단위 × 전신환 적용환율)
총 출금액 = 원화 환산 송금원금 + 송금수수료 + 전신료
```

### 반올림 규칙

1. **적용환율**을 먼저 소수점 2자리로 반올림합니다.
2. 반올림된 적용환율을 사용해 **원화 금액**을 정수 원 단위로 반올림합니다.

---

## 해외송금 수수료표

송금수수료는 **USD 상당액 구간**을 기준으로 합니다. (과제용 예시 기준이며, 실제 은행 수수료와 다를 수 있습니다.)

| 송금 금액 기준 (USD 상당액) | 송금수수료 |
|----------------------------|-----------|
| 500달러 이하 | 5,000원 |
| 2,000달러 이하 | 10,000원 |
| 5,000달러 이하 | 15,000원 |
| 10,000달러 이하 | 20,000원 |
| 10,000달러 초과 | 25,000원 |

| 항목 | 금액 |
|------|------|
| 전신료 | 건당 8,000원 |

---

## FSD 프로젝트 구조

본 프로젝트는 [Feature-Sliced Design](https://feature-sliced.design/)을 적용합니다.

```text
src/
├── app/          # 앱 진입점, 전역 조립
├── pages/        # 페이지 단위 화면 (dashboard)
├── widgets/      # 여러 feature를 조합한 UI 블록
├── features/     # 사용자 행동 단위 기능
├── entities/     # 도메인 타입, 순수 계산·저장 로직
└── shared/       # 공용 UI, 유틸, 설정, API 클라이언트
```

### 레이어별 역할

| 레이어 | 역할 | 주요 슬라이스 예시 |
|--------|------|-------------------|
| `app` | React 앱 진입·전역 레이아웃 | `App.tsx` |
| `pages` | 라우트/페이지 단위 화면 | `dashboard` |
| `widgets` | 독립 UI 섹션 조합 | `calculation-panel`, `transaction-history-panel` |
| `features` | 사용자 액션(폼, 버튼, 검색) | `calculate-exchange`, `calculate-remittance`, `load-exchange-rate`, `add-transaction` |
| `entities` | 비즈니스 로직·타입 | `rate`, `remittance`, `transaction`, `exchange-rate` |
| `shared` | 도메인 무관 공용 코드 | `ui`, `lib`, `config`, `api` |

### 의존 방향

```text
app → pages → widgets → features → entities → shared
```

상위 레이어는 하위 레이어만 import할 수 있습니다. 자세한 규칙은 `docs/ARCHITECTURE.md`와 `.cursor/rules/00-architecture.mdc`를 참고하세요.

---

## 테스트 및 AI 협업 방식

### Vitest 테스트

핵심 계산 로직(환전·해외송금·거래 기록·환율 파싱·통화 설정)은 `entities`·`shared` 레이어에서 Vitest로 검증합니다.

```bash
npm run test
```

### Cursor Rules

`.cursor/rules/`에 아키텍처·도메인·UI·테스트 규칙을 정의해 AI 협업 시 일관된 코드 스타일과 FSD 의존 방향을 유지합니다.

| Rule 파일 | 내용 |
|-----------|------|
| `00-architecture.mdc` | FSD 레이어 구조·import 규칙 |
| `10-domain-fx.mdc` | 환전·송금 계산식, 통화 단위, 반올림 |
| `20-ui.mdc` | UI·컴포넌트 작성 기준 |
| `30-testing.mdc` | Vitest 테스트 작성 기준 |

### Context7 MCP

라이브러리·API 공식 문서 조회가 필요할 때 Context7 MCP를 활용합니다. (예: React, Vite, Vitest, TailwindCSS 문서 확인)

### CodeRabbit

Pull Request 생성 시 [CodeRabbit](https://coderabbit.ai/)이 자동 코드 리뷰를 수행합니다. 리뷰 기준은 프로젝트 루트의 `.coderabbit.yaml`에 정의되어 있습니다.

| 설정 | 값 |
|------|-----|
| 리뷰 언어 | `ko-KR` |
| 프로필 | `chill` |
| 요약 | `high_level_summary: true` |

**중점 리뷰 항목:** FSD 의존 방향, 계산 로직·UI 분리, JPY/IDR 100단위 처리, API 키 노출 방지, 테스트 기대값 유지, 문서·구현 일치

**리뷰 제외 경로:** `node_modules`, `dist`, `coverage`, lock 파일, `.env`, `*.log`

GitHub 저장소에 CodeRabbit 앱을 연동한 뒤 PR을 생성하면 설정이 적용됩니다.

### 개발 Workflow

`docs/WORKFLOW.md`에 정의된 **Plan → Test → Act → Reflect** 흐름을 따릅니다.

| 단계 | 설명 |
|------|------|
| **Plan** | PRD·아키텍처·Rules 확인, 구현 범위·레이어 설계 |
| **Test** | 핵심 순수 함수에 대한 Vitest 테스트 설계·작성 |
| **Act** | FSD 구조에 맞게 코드·UI 구현 |
| **Reflect** | `docs/prompts.md`에 작업 기록, 테스트·빌드 결과 정리 |

주요 프롬프트와 작업 이력은 `docs/prompts.md`에서 확인할 수 있습니다.

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [docs/PRD.md](docs/PRD.md) | 제품 요구사항 정의 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | FSD 아키텍처·레이어 설계 |
| [docs/WORKFLOW.md](docs/WORKFLOW.md) | AI 협업 개발 흐름 |
| [docs/API_PLAN.md](docs/API_PLAN.md) | 환율 API 연동 설계 |
| [docs/prompts.md](docs/prompts.md) | Cursor 협업 프롬프트·작업 기록 |

---

## 주의사항

- **실제 개인정보 입력 금지**  
  주민등록번호, 계좌번호, 실제 주소 등 민감한 개인정보를 고객명·메모에 입력하지 마세요.

- **localStorage는 보안 저장소가 아님**  
  거래 기록은 현재 브라우저에만 저장되며, 다른 기기·브라우저와 공유되지 않습니다. 공용 PC에서는 사용 후 기록 삭제를 권장합니다.

- **실제 은행 기준과 다를 수 있음**  
  환율·스프레드·수수료·우대율은 과제·학습용 예시입니다. 실제 창구 거래 시 은행 고시 환율과 수수료 정책을 확인하세요.

- **API 키 노출 금지**  
  `VITE_EXCHANGE_API_KEY`를 Git 저장소, 스크린샷, 공개 채널에 올리지 마세요.

---

## 라이선스

본 프로젝트는 학습·과제 제출용으로 작성되었습니다.
