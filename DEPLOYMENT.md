# AllinPay - Cloudflare Pages + D1 + Functions 배포 가이드

## 🚀 배포 단계

### 1. Cloudflare CLI 설치 및 로그인
```bash
# Cloudflare CLI 설치
npm install -g wrangler

# 로그인
wrangler login
```

### 2. D1 데이터베이스 생성
```bash
# D1 데이터베이스 생성
wrangler d1 create allinpay-db

# 생성된 데이터베이스 ID를 wrangler.toml에 업데이트
# database_id = "your-actual-database-id-here"

# 스키마 적용
wrangler d1 execute allinpay-db --file=./schema.sql
```

### 3. 로컬 개발
```bash
# 로컬 개발 서버 실행
wrangler pages dev
```

### 4. 배포
```bash
# 배포
wrangler pages deploy
```

## 📁 프로젝트 구조

```
allinpay/
├── index.html              # 메인 HTML 파일
├── styles.css              # CSS 스타일
├── script.js              # JavaScript 로직
├── functions/              # Cloudflare Pages Functions
│   └── api/
│       ├── save-answer.js
│       ├── generate-result.js
│       ├── book-consultation.js
│       └── get-session.js
├── schema.sql             # D1 데이터베이스 스키마
├── wrangler.toml          # Cloudflare 설정
└── README.md
```

## 🔧 주요 기능

### API 엔드포인트
- `POST /api/save-answer` - 사용자 답변 저장
- `POST /api/generate-result` - 상담 결과 생성
- `POST /api/book-consultation` - 상담 예약
- `GET /api/get-session` - 세션 정보 조회

### 데이터베이스 테이블
- `consultation_sessions` - 상담 세션 관리
- `user_answers` - 사용자 답변 저장
- `consultation_results` - 상담 결과 저장
- `consultation_bookings` - 상담 예약 관리

## 🌐 환경 변수

Cloudflare Pages 대시보드에서 설정:
- `DB` - D1 데이터베이스 바인딩 (자동 설정)

## 📱 기능 특징

- ✅ **순수 HTML/CSS/JS**: 프레임워크 없이 구현
- ✅ **실시간 답변 저장**: 모든 답변이 D1에 저장
- ✅ **동적 상담 결과**: 답변에 따른 맞춤 대출 조건 계산
- ✅ **상담 예약 시스템**: 연락처 수집 및 예약 관리
- ✅ **세션 관리**: 사용자별 상담 이력 추적
- ✅ **반응형 디자인**: 모바일/데스크톱 최적화
- ✅ **88 Company 스타일**: 동일한 디자인과 UX

## 🔒 보안 고려사항

- 입력 데이터 검증
- SQL 인젝션 방지
- 세션 ID 기반 데이터 격리
- 에러 핸들링 및 로깅
- CORS 설정

## 🎨 디자인 특징

- **색상**: 청록색(#00E5DB) → 파란색(#4DA3FF) 그라데이션
- **테마**: 다크 모드 우선 디자인
- **애니메이션**: CSS 기반 부드러운 전환 효과
- **반응형**: 모바일 우선 반응형 디자인

## 📊 사용자 경험

1. **환영 메시지** - 서비스 소개 및 안내
2. **단계별 질문** - 5개 핵심 질문으로 정보 수집
3. **진행률 표시** - 시각적 진행 상황 확인
4. **상담 결과** - 맞춤 대출 조건 및 추천 상품
5. **상담 예약** - 추가 상담을 위한 연락처 수집

## 🔧 커스터마이징

### 질문 수정
`script.js`의 `questions` 배열에서 질문과 답변 옵션을 수정할 수 있습니다.

### 대출 조건 로직
`functions/api/generate-result.js`의 `calculateLoanConditions` 함수에서 대출 조건 계산 로직을 수정할 수 있습니다.

### 스타일 변경
`styles.css`에서 색상, 애니메이션 등을 커스터마이징할 수 있습니다.

## 📈 확장 가능성

- **AI 통합**: 더 정교한 대출 조건 계산
- **실시간 알림**: 상담 예약 및 결과 알림
- **관리자 대시보드**: 상담 현황 및 통계 관리
- **다국어 지원**: 글로벌 서비스 확장
- **PWA 지원**: 앱처럼 사용 가능

## 🐛 디버깅

### 로컬 디버깅
```bash
# 로컬에서 Functions 테스트
wrangler pages dev --local

# D1 데이터베이스 로컬 테스트
wrangler d1 execute allinpay-db --local --file=./schema.sql
```

### 로그 확인
```bash
# 실시간 로그 확인
wrangler tail
```

## 📄 라이선스

MIT License
