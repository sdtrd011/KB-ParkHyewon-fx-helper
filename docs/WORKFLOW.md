# WORKFLOW: KB 외환 창구 도우미

## 1. 문서 개요

본 문서는 `KB-ParkHyewon-fx-helper` 프로젝트에서 AI와 함께 개발할 때 따르는 표준 작업 흐름을 정의한다.

본 프로젝트의 기본 개발 흐름은 다음과 같다.

```text
Plan → Test → Act → Reflect
```

이 흐름은 요구사항 정리, 테스트 설계, 구현, 작업 정리까지의 전체 개발 사이클을 통제하기 위한 기준이다.

---

## 2. Workflow 핵심 원칙

### 2.1 Context-driven 개발

AI Agent는 코드 작성 능력은 높지만, 프로젝트의 업무 맥락과 아키텍처 기준을 자동으로 알지는 못한다.  
따라서 구현 전에 필요한 Context를 충분히 제공해야 한다.

본 프로젝트에서 Context는 다음 문서와 파일을 기준으로 제공한다.


| Context 종류 | 위치                                  | 목적                |
| ---------- | ----------------------------------- | ----------------- |
| 제품 요구사항    | `docs/PRD.md`                       | 무엇을 만들지 정의        |
| 아키텍처 기준    | `docs/ARCHITECTURE.md`              | FSD 구조와 의존 규칙 정의  |
| 작업 흐름      | `docs/WORKFLOW.md`                  | AI와 함께 일하는 단계 정의  |
| 프롬프트 기록    | `docs/prompts.md`                   | 주요 요청과 결과 기록      |
| 아키텍처 Rule  | `.cursor/rules/00-architecture.mdc` | FSD 구조 상시 적용      |
| 도메인 Rule   | `.cursor/rules/10-domain-fx.mdc`    | 환전·송금 계산 규칙 적용    |
| UI Rule    | `.cursor/rules/20-ui.mdc`           | 화면과 컴포넌트 작성 기준 적용 |
| 테스트 Rule   | `.cursor/rules/30-testing.mdc`      | 테스트 작성 기준 적용      |


---

## 3. 전체 개발 프로세스

본 프로젝트는 다음 4단계 프로세스를 따른다.

```text
Phase 1. Plan
Phase 1.5. Test
Phase 2. Act
Phase 3. Reflect
```

각 단계는 명확한 목적과 완료 조건을 가진다.

---

## 4. Phase 1: Plan

### 4.1 목적

Plan 단계는 구현 전에 필요한 요구사항, 아키텍처, 영향 범위, 작업 순서를 정리하는 단계이다.

이 단계에서는 코드를 바로 작성하지 않는다.  
먼저 무엇을 만들지, 어떤 레이어를 수정할지, 어떤 테스트가 필요한지 정리한다.

### 4.2 수행 작업

Plan 단계에서 수행하는 작업은 다음과 같다.

1. `docs/PRD.md` 확인
2. `docs/ARCHITECTURE.md` 확인
3. 관련 Cursor Rules 확인
4. 구현할 기능의 범위 정의
5. 수정 또는 생성할 레이어와 슬라이스 식별
6. 필요한 타입, 함수, UI 컴포넌트 목록 작성
7. 테스트가 필요한 순수 함수 식별
8. 구현 순서 제안

### 4.3 Plan 단계 산출물

Plan 단계가 끝나면 다음 내용이 정리되어야 한다.

```text
- 구현 대상 기능
- 수정 또는 생성할 파일 목록
- 관련 FSD 레이어
- 필요한 타입과 함수
- 테스트 대상
- 구현 순서
```

### 4.4 Plan 단계 예시

환전 계산 기능을 구현하는 경우 Plan 단계에서는 다음을 정리한다.

```text
기능: 환전 계산기
관련 레이어:
- shared/config (currencies)
- entities/rate
- features/calculate-exchange
- widgets/calculation-panel

테스트 대상:
- calculateExchange 함수
- JPY·IDR 100단위 처리
- 우대율 0%, 50%, 100% 계산

구현 순서:
1. shared/config 통화 설정 작성
2. calculateExchange 순수 함수 테스트 작성
3. calculateExchange 함수 구현
4. 환전 계산 입력 폼 작성
5. calculation-panel에 연결
```

### 4.5 Plan 단계 완료 조건

다음 조건을 충족해야 다음 단계로 넘어갈 수 있다.

- 요구사항이 명확하다.
- 관련 문서를 확인했다.
- FSD 레이어 배치가 정해졌다.
- 생성 또는 수정할 파일 범위가 정해졌다.
- 테스트 대상이 식별되었다.

---

## 5. Phase 1.5: Test

### 5.1 목적

Test 단계는 구현 전에 핵심 로직의 테스트 케이스를 먼저 설계하거나 작성하는 단계이다.

본 프로젝트에서는 모든 UI에 대해 테스트를 작성하지 않는다.  
대신 환전 계산, 해외송금 계산, 포맷 유틸처럼 결과가 명확한 순수 함수를 중심으로 테스트한다.

### 5.2 수행 작업

Test 단계에서 수행하는 작업은 다음과 같다.

1. 테스트 대상 함수 확인
2. 정상 케이스 정의
3. 예외 케이스 정의
4. JPY 100엔 단위 케이스 정의
5. 우대율 0%, 50%, 100% 케이스 정의
6. 과제 Sample 시나리오를 회귀 테스트로 반영
7. Vitest 테스트 파일 작성

### 5.3 테스트 대상

본 프로젝트의 주요 테스트 대상은 다음과 같다.


| 대상      | 위치                    | 테스트 내용                        |
| ------- | --------------------- | ----------------------------- |
| 환전 계산   | `entities/rate`       | 현찰 살 때/팔 때, 우대율, JPY 단위       |
| 해외송금 계산 | `entities/remittance` | 전신환 적용환율, 수수료, 전신료, 총 비용      |
| 포맷 유틸   | `shared/lib`          | 원화 포맷, 환율 포맷, 숫자 반올림          |
| CSV 유틸  | `shared/lib`          | CSV 헤더, UTF-8 BOM, 값 escaping |


### 5.4 테스트 파일 위치

테스트 파일은 대상 코드와 가까운 위치에 둔다.

```text
src/entities/rate/model/calculateExchange.test.ts
src/entities/remittance/model/calculateRemittance.test.ts
src/shared/lib/format.test.ts
src/shared/lib/csv.test.ts
```

### 5.5 Test 단계 완료 조건

다음 조건을 충족하면 Act 단계로 넘어간다.

- 핵심 테스트 케이스가 작성되었다.
- 테스트 파일 위치가 FSD 구조에 맞다.
- 테스트가 실패하더라도 실패 이유가 명확하다.
- 구현할 함수의 입력과 출력이 확정되었다.

---

## 6. Phase 2: Act

### 6.1 목적

Act 단계는 Plan과 Test에서 정리한 내용을 기준으로 실제 코드를 구현하는 단계이다.

이 단계에서는 한 번에 모든 코드를 작성하지 않고, **하위 레이어에서 상위 레이어 순서**로 구현한다.

```text
구현 순서: shared → entities → features → widgets → pages → app
```

FSD **import 의존 방향**(상위 레이어가 하위를 참조)은 다음과 같으며, 구현 순서와는 별개 개념이다.

```text
import 방향: app → pages → widgets → features → entities → shared
```

단, 공용 포맷 유틸처럼 도메인 계산에 먼저 필요한 `shared/lib`는 `entities` 구현 전에 작성할 수 있다.

### 6.2 구현 순서

본 프로젝트의 기본 구현 순서는 다음과 같다.

```text
1. shared/lib 공용 유틸 작성
2. shared/config 통화 설정 작성 (currencies.ts)
3. entities/rate 환전 계산 로직 작성
4. entities/remittance 해외송금 계산 로직 작성
5. entities/transaction 거래 기록 타입과 저장 로직 작성
6. entities/exchange-rate 환율 API 파싱·조회 작성
7. features/calculate-exchange 작성
8. features/calculate-remittance 작성
9. features/load-exchange-rate 작성
10. features/add-transaction 작성
11. features/search-transaction 작성
12. features/toggle-theme 작성
13. widgets/calculation-panel 작성
14. widgets/transaction-history-panel 작성
15. pages/dashboard 작성
16. app/App.tsx 연결
17. npm run dev로 화면 확인
18. npm run test로 테스트 확인
19. npm run build로 빌드 확인
```

### 6.3 Act 단계 규칙

Act 단계에서는 다음 규칙을 지킨다.

- FSD 의존 방향을 위반하지 않는다.
- 계산 로직을 React 컴포넌트 내부에 작성하지 않는다.
- 각 슬라이스는 `index.ts`로 필요한 항목만 공개한다.
- 컴포넌트는 함수형 컴포넌트로 작성한다.
- UI 텍스트는 한국어로 작성한다.
- 금액과 환율 표시는 공용 포맷 유틸을 사용한다.
- localStorage key는 공용 설정 또는 transaction 엔티티에서 관리한다.
- 새 기능을 추가하면 관련 테스트 또는 검증 방법을 함께 작성한다.

### 6.4 Act 단계 완료 조건

다음 조건을 충족해야 Reflect 단계로 넘어간다.

- 구현 대상 기능이 화면에서 동작한다.
- 관련 테스트가 통과한다.
- `npm run dev` 실행 시 오류가 없다.
- `npm run build`가 성공한다.
- FSD 의존 규칙을 위반하지 않는다.
- 사용자 시나리오 기준으로 주요 기능을 확인했다.

---

## 7. Phase 3: Reflect

### 7.1 목적

Reflect 단계는 구현 완료 후 작업 내용을 정리하고, 다음 작업자가 이해할 수 있도록 히스토리를 남기는 단계이다.

이 단계에서는 단순히 “완료”로 끝내지 않고, 무엇을 구현했고 어떤 기준으로 검증했는지 기록한다.

### 7.2 수행 작업

Reflect 단계에서 수행하는 작업은 다음과 같다.

1. 구현한 기능 요약
2. 수정한 파일 목록 정리
3. 테스트 실행 결과 기록
4. 빌드 실행 결과 기록
5. FSD 구조 준수 여부 확인
6. 남은 이슈 또는 개선점 정리
7. 주요 프롬프트를 `docs/prompts.md`에 기록
8. 필요 시 `REPORT.md`에 반영할 내용 정리

### 7.3 Reflect 단계 산출물

Reflect 단계가 끝나면 다음 내용이 남아야 한다.

```text
- 구현 요약
- 테스트 결과
- 빌드 결과
- 변경 파일 목록
- 남은 작업
- 주요 프롬프트 기록
```

### 7.4 Reflect 단계 완료 조건

다음 조건을 충족하면 하나의 개발 사이클이 종료된다.

- 작업 내용이 요약되었다.
- 테스트 결과가 확인되었다.
- 빌드 결과가 확인되었다.
- 프롬프트 기록이 남았다.
- 다음 작업이 명확해졌다.

---

## 8. 단계 전환 규칙

### 8.1 Plan → Test

다음 조건을 충족하면 Test 단계로 넘어간다.

- 요구사항이 정리되었다.
- 관련 레이어와 슬라이스가 정해졌다.
- 테스트 대상 순수 함수가 식별되었다.
- 사용자가 테스트 작성을 요청했거나, 계산 로직처럼 테스트가 필요한 기능이다.

테스트 단계 진입 트리거 예시:

```text
테스트 작성해줘
TDD로 진행해줘
Vitest 테스트부터 만들어줘
Sample 시나리오 반영해줘
```

---

### 8.2 Test → Act

다음 조건을 충족하면 Act 단계로 넘어간다.

- 테스트 케이스가 작성되었다.
- 입력과 출력 타입이 명확하다.
- 실패하는 테스트의 목적이 명확하다.
- 구현할 함수 범위가 확정되었다.

테스트를 먼저 작성하지 않는 UI 작업의 경우, Plan 단계에서 구현 범위와 수동 검증 방법을 정리한 뒤 Act로 넘어갈 수 있다.

---

### 8.3 Act → Reflect

다음 조건을 충족하면 Reflect 단계로 넘어간다.

- 기능 구현이 완료되었다.
- 테스트가 통과했다.
- 화면에서 주요 시나리오를 확인했다.
- 빌드가 성공했다.
- 사용자가 작업 정리 또는 문서화를 요청했다.

Reflect 단계 진입 트리거 예시:

```text
정리해줘
완료됐어
문서화해줘
히스토리 정리해줘
REPORT에 넣을 내용 정리해줘
```

---

## 9. 예외 상황 처리

### 9.1 Act → Test 복귀

구현 중 테스트가 부족하다고 판단되면 Test 단계로 돌아간다.

예:

- 환전 계산식이 복잡해졌다.
- JPY 단위 처리가 불명확하다.
- 해외송금 수수료 계산이 추가되었다.
- Sample 시나리오와 계산 결과가 다르다.

### 9.2 Test → Plan 복귀

테스트 설계 중 요구사항이 불명확하면 Plan 단계로 돌아간다.

예:

- 스프레드율을 입력값으로 받을지 설정값으로 둘지 불명확하다.
- 송금수수료와 전신료의 기본값이 불명확하다.
- 거래 기록에 저장할 항목이 불명확하다.
- 화면 탭 구조가 확정되지 않았다.

### 9.3 Act → Plan 복귀

구현 중 구조 변경이 필요한 경우 Plan 단계로 돌아간다.

예:

- 새 엔티티가 필요하다.
- 슬라이스 위치가 잘못되었다.
- features에 들어간 로직을 entities로 내려야 한다.
- shared에 도메인 로직이 들어갔다.

---

## 10. 작업 단위 기준

하나의 작업 단위는 너무 크지 않게 나눈다.

권장 작업 단위:

```text
1. 문서 작성
2. Rules 작성
3. 공용 유틸 작성
4. 환전 계산 로직 작성
5. 해외송금 계산 로직 작성
6. 거래 기록 저장 로직 작성
7. 환전 계산 UI 작성
8. 해외송금 계산 UI 작성
9. 거래 기록 UI 작성
10. CSV 내보내기 작성
11. 테스트 보강
12. REPORT 정리
```

작업 단위를 나누는 이유:

- AI가 한 번에 처리할 Context를 줄이기 위해
- 오류 발생 시 원인을 찾기 쉽게 하기 위해
- 코드리뷰 단위를 명확히 하기 위해
- 테스트와 구현을 함께 관리하기 위해

---

## 11. Cursor 사용 기준

### 11.1 Ask 모드 사용

다음 상황에서는 Cursor Ask를 사용한다.

- 요구사항 해석
- 설계 방향 질문
- FSD 위치 판단
- 계산식 확인
- 에러 원인 분석
- 테스트 케이스 설계

### 11.2 Agent 또는 Composer 사용

다음 상황에서는 Agent 또는 Composer를 사용한다.

- 여러 파일을 동시에 생성해야 할 때
- FSD 폴더 구조를 만들 때
- 하나의 feature를 구현할 때
- 테스트와 구현을 함께 작성할 때
- 리팩토링 범위가 여러 파일에 걸칠 때

### 11.3 사용 전 확인할 문서

Agent에게 작업을 맡기기 전 다음 문서를 참조시킨다.

```text
docs/PRD.md
docs/ARCHITECTURE.md
docs/WORKFLOW.md
.cursor/rules/00-architecture.mdc
.cursor/rules/10-domain-fx.mdc
.cursor/rules/20-ui.mdc
.cursor/rules/30-testing.mdc
```

### 11.4 프롬프트 기록

주요 작업 요청은 `docs/prompts.md`에 기록한다.

기록 항목:

```text
- 날짜
- 작업 목적
- 사용한 프롬프트
- 생성 또는 수정된 파일
- 결과 요약
- 추가 수정 사항
```

---

## 12. CodeRabbit 리뷰 Workflow

CodeRabbit을 사용하는 경우 기능 단위로 PR을 만들고 자동 리뷰를 받는다.

### 12.1 PR 단위

권장 PR 단위:

```text
1. FSD 기본 구조 생성
2. 환전 계산 로직 + 테스트
3. 해외송금 계산 로직 + 테스트
4. 거래 기록 localStorage
5. 환전/송금 UI
6. 거래 기록 UI + CSV
7. 문서 및 REPORT 정리
```

### 12.2 리뷰 기준

CodeRabbit 리뷰에서는 다음 항목을 중점적으로 확인한다.

- FSD 레이어 의존 방향 위반 여부
- 계산 로직과 UI 분리 여부
- 테스트 누락 여부
- 타입 안정성
- 중복 코드
- 네이밍 일관성
- localStorage 사용 방식
- 개인정보 입력 주의 문구 포함 여부

---

## 13. MCP 사용 Workflow

`.cursor/mcp.json`은 팀 공용 MCP 설정 파일로 사용한다.

활용 목적:

- 문서 조회 도구 연결
- 파일 시스템 기반 작업 보조
- context7 등 라이브러리 문서 확인
- 팀 공통 AI 개발 환경 공유

MCP를 사용할 때도 무조건 구현을 먼저 요청하지 않는다.  
Plan 단계에서 필요한 문서와 Context를 먼저 확인한 뒤 사용한다.

---

## 14. 완료 전 체크리스트

작업 완료 전 다음 항목을 확인한다.

### 14.1 기능 체크

- 환전 계산기가 동작하는가?
- 현찰 살 때/팔 때 계산식이 구분되는가?
- JPY 100엔 단위가 반영되는가?
- 해외송금 비용 계산기가 동작하는가?
- 거래 기록 추가/삭제/검색이 가능한가?
- 새로고침 후 거래 기록이 유지되는가?
- CSV 내보내기가 동작하는가?

### 14.2 구조 체크

- FSD 레이어 구조를 따르는가?
- 각 슬라이스에 `index.ts`가 있는가?
- Public API를 통해 import하는가?
- 동일 레이어 슬라이스 간 직접 import가 없는가?
- 계산 로직이 UI와 분리되어 있는가?

### 14.3 테스트 체크

- 환전 계산 테스트가 있는가?
- 해외송금 계산 테스트가 있는가?
- JPY 단위 테스트가 있는가?
- 우대율 케이스 테스트가 있는가?
- `npm run test`가 성공하는가?

### 14.4 실행 체크

- `npm run dev`가 정상 실행되는가?
- `npm run build`가 성공하는가?
- 콘솔 에러가 없는가?

### 14.5 문서 체크

- `docs/PRD.md`가 최신인가?
- `docs/ARCHITECTURE.md`가 최신인가?
- `docs/WORKFLOW.md`가 작성되어 있는가?
- `docs/prompts.md`에 주요 프롬프트가 기록되어 있는가?
- `REPORT.md`에 최종 제출 내용이 정리되어 있는가?

---

## 15. 프로젝트 전체 진행 순서

본 프로젝트는 다음 순서로 진행한다.

```text
1. PRD 작성
2. ARCHITECTURE 작성
3. WORKFLOW 작성
4. Cursor Rules 작성
5. MCP 설정 작성
6. CodeRabbit 설정 작성
7. FSD 폴더 구조 생성
8. 공용 유틸 작성
9. 통화/환전/송금/거래 엔티티 작성
10. Vitest 테스트 작성
11. 환전 계산 기능 구현
12. 해외송금 계산 기능 구현
13. 거래 기록 기능 구현
14. 거래 기록 CSV 내보내기 구현
15. 대시보드 UI 조립
16. 테스트 실행
17. 빌드 확인
18. prompts.md 정리
19. REPORT.md 작성
20. 제출용 ZIP 생성
```

---

## 16. 최종 산출물

최종 제출 전 다음 산출물이 존재해야 한다.

```text
KB-ParkHyewon-fx-helper/
├── README.md
├── REPORT.md
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
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── src/
    ├── app/
    ├── pages/
    ├── widgets/
    ├── features/
    ├── entities/
    └── shared/
```

