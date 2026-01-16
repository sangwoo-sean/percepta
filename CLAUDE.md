# Percepta Project Context

AI 에이전트가 이 프로젝트를 효과적으로 관리하기 위한 컨텍스트 문서입니다.

## 프로젝트 개요

Percepta는 AI 페르소나 기반 피드백 서비스입니다. 사용자가 콘텐츠(텍스트, 파일, URL)를 제출하면, 다양한 AI 페르소나가 해당 콘텐츠에 대한 피드백을 생성합니다.

### 핵심 기능
- Google OAuth 로그인
- AI 페르소나 생성/관리 (자동 이름/아바타 생성)
- 콘텐츠 피드백 요청 (텍스트, 파일 업로드, URL 스크래핑)
- Google Gemini를 통한 AI 피드백 생성
- 크레딧 기반 사용량 관리

## 기술 스택

| 영역 | 기술 |
|------|------|
| 모노레포 | pnpm workspace |
| 백엔드 | NestJS 10 + TypeORM |
| 프론트엔드 | React 18 + Vite 6 + Tailwind CSS 3 |
| 상태관리 | Redux Toolkit |
| 데이터베이스 | PostgreSQL 16 (Docker) |
| 인증 | JWT + Google OAuth (Passport.js) |
| 파일 저장 | Supabase Storage |
| AI | Google Gemini API (gemini-2.0-flash) |
| 테스트 | Jest (백엔드), Vitest (프론트엔드) |

## 프로젝트 구조

```
percepta/
├── backend/
│   └── src/
│       ├── main.ts                 # 앱 엔트리포인트
│       ├── app.module.ts           # 루트 모듈
│       └── modules/
│           ├── auth/               # 인증 (JWT, Google OAuth)
│           ├── users/              # 사용자 관리
│           ├── personas/           # 페르소나 CRUD
│           ├── feedback/           # 피드백 세션/결과
│           ├── upload/             # 파일 업로드, URL 스크래핑
│           └── ai/                 # Gemini API 연동
├── frontend/
│   └── src/
│       ├── api/                    # API 클라이언트
│       ├── components/             # React 컴포넌트
│       │   ├── common/             # 공통 UI (Button, Input, Card, Modal)
│       │   ├── layout/             # 레이아웃 (Header, Sidebar, Layout)
│       │   ├── persona/            # 페르소나 관련
│       │   └── feedback/           # 피드백 관련
│       ├── hooks/                  # 커스텀 훅
│       ├── pages/                  # 페이지 컴포넌트
│       ├── store/                  # Redux 슬라이스
│       └── types/                  # TypeScript 타입 정의
├── docker-compose.yml              # PostgreSQL
├── package.json                    # 워크스페이스 루트
└── pnpm-workspace.yaml
```

## 주요 명령어

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm --filter backend dev      # 백엔드 (localhost:3000)
pnpm --filter frontend dev     # 프론트엔드 (localhost:5173)

# 빌드
pnpm --filter backend build
pnpm --filter frontend build

# 테스트
pnpm --filter backend test
pnpm --filter frontend test

# Docker PostgreSQL
docker-compose up -d           # 시작
docker-compose down            # 중지

# 타입 체크
pnpm --filter backend build    # NestJS는 빌드 시 타입체크
pnpm --filter frontend build   # Vite + tsc
```

## 데이터베이스 스키마

### users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| email | VARCHAR | 유니크 |
| name | VARCHAR | |
| avatar_url | VARCHAR | nullable |
| google_id | VARCHAR | nullable |
| credits | INTEGER | 기본값 10 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### personas
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| name | VARCHAR | |
| avatar_url | VARCHAR | nullable |
| age_group | VARCHAR | '10s', '20s', '30s', '40s', '50s', '60+' |
| occupation | VARCHAR | |
| personality_traits | JSONB | string[] |
| description | TEXT | nullable |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### feedback_sessions
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| user_id | UUID | FK → users |
| input_type | VARCHAR | 'file', 'url', 'text' |
| input_content | TEXT | |
| input_url | VARCHAR | nullable |
| status | VARCHAR | 'pending', 'processing', 'completed', 'failed' |
| summary | TEXT | nullable, AI 종합 분석 |
| credits_used | INTEGER | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### feedback_results
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | PK |
| session_id | UUID | FK → feedback_sessions |
| persona_id | UUID | FK → personas |
| feedback_text | TEXT | |
| sentiment | VARCHAR | 'positive', 'neutral', 'negative' |
| purchase_intent | VARCHAR | 'high', 'medium', 'low', 'none' |
| key_points | JSONB | string[] |
| score | DECIMAL(3,2) | 1.0 ~ 5.0 |
| created_at | TIMESTAMP | |

## API 엔드포인트

### Auth
- `GET /api/auth/google` - Google OAuth 시작
- `GET /api/auth/google/callback` - OAuth 콜백
- `GET /api/auth/me` - 현재 사용자 정보 (JWT 필요)

### Personas
- `GET /api/personas` - 목록 조회
- `GET /api/personas/:id` - 상세 조회
- `POST /api/personas` - 생성
- `POST /api/personas/batch` - 일괄 생성
- `GET /api/personas/stats` - 통계
- `DELETE /api/personas/:id` - 삭제

### Upload
- `POST /api/upload/file` - 파일 업로드 (multipart/form-data)
- `POST /api/upload/url` - URL 스크래핑

### Feedback
- `GET /api/feedback/sessions` - 세션 목록
- `GET /api/feedback/sessions/:id` - 세션 상세
- `POST /api/feedback/sessions` - 세션 생성
- `POST /api/feedback/sessions/:id/generate` - 피드백 생성
- `GET /api/feedback/sessions/:id/summary` - 종합 요약 생성

## 환경 변수

`backend/.env.example` 참조:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=percepta
DATABASE_PASSWORD=percepta_password
DATABASE_NAME=percepta

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Supabase Storage
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_BUCKET=uploads

# Google Gemini
GEMINI_API_KEY=

# App
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## 코드 컨벤션

### 백엔드
- NestJS 모듈 구조 준수
- 서비스에 비즈니스 로직 집중
- DTO로 입력 검증 (class-validator)
- 엔티티는 snake_case 컬럼명, camelCase 프로퍼티
- 테스트 파일: `*.spec.ts`

### 프론트엔드
- 함수형 컴포넌트 + Hooks
- 컴포넌트 파일명: PascalCase
- 페이지 컴포넌트: `*Page.tsx`
- Tailwind CSS 유틸리티 클래스 사용
- Redux slice별 상태 관리
- 테스트 파일: `*.test.tsx`

## Git 컨벤션

### 커밋 메시지 형식
```
<type>(<scope>): <description>

<body (optional)>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Type
| Type | 설명 |
|------|------|
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| docs | 문서 변경 |
| style | 코드 포맷팅 (기능 변경 없음) |
| refactor | 리팩토링 |
| test | 테스트 추가/수정 |
| chore | 빌드, 설정 파일 변경 |

### Scope
| Scope | 설명 |
|-------|------|
| root | 루트 설정 (모노레포, 워크스페이스) |
| infra | 인프라 설정 (Docker, CI/CD) |
| backend | 백엔드 전체 또는 기본 설정 |
| frontend | 프론트엔드 전체 또는 기본 설정 |
| (모듈명) | 특정 모듈 (예: auth, users, personas) |

### 커밋 단위 기준
작업을 다음 기준으로 논리적 단위로 분리하여 커밋:

1. **인프라/설정 단위**
   - 모노레포 구조 설정
   - Docker/CI 설정
   - 패키지 의존성 변경

2. **백엔드 모듈 단위**
   - 각 NestJS 모듈별로 커밋 (엔티티 + 서비스 + 컨트롤러 + 테스트)
   - 순서: Users → Auth → Personas → Upload → AI → Feedback

3. **프론트엔드 레이어 단위**
   - 기본 설정 (Vite, TypeScript, Tailwind)
   - 공통 UI 컴포넌트 (Button, Input, Card, Modal)
   - 레이아웃 컴포넌트 (Header, Sidebar, Layout)
   - API 클라이언트 및 상태 관리 (Redux)
   - 도메인 컴포넌트 (페르소나, 피드백)
   - 페이지 컴포넌트

4. **문서화**
   - README, CLAUDE.md 등 문서 변경은 별도 커밋

### 커밋 예시
```bash
# 인프라 설정
feat(root): pnpm 워크스페이스 기반 모노레포 구조 설정
feat(infra): PostgreSQL Docker Compose 설정

# 백엔드 모듈
feat(backend): NestJS 백엔드 기본 설정
feat(backend): Users 모듈 구현
feat(backend): Auth 모듈 구현
feat(backend): Personas 모듈 구현

# 프론트엔드
feat(frontend): React + Vite + Tailwind 기본 설정
feat(frontend): 공통 UI 컴포넌트 구현
feat(frontend): 레이아웃 컴포넌트 구현
feat(frontend): API 클라이언트 및 상태 관리 구현
feat(frontend): 페르소나 컴포넌트 구현
feat(frontend): 페이지 컴포넌트 구현

# 문서화
docs: AI 에이전트용 프로젝트 컨텍스트 문서 작성
```

## 작업 시 주의사항

1. **크레딧 시스템**: 페르소나당 1크레딧 차감. 크레딧 부족 시 피드백 생성 불가.

2. **Gemini API 실패 처리**: API 실패 시 mock 응답 반환 (개발/테스트용).

3. **TypeORM synchronize**: 개발 환경에서만 true. 프로덕션에서는 마이그레이션 사용.

4. **CORS**: 프론트엔드 URL (기본 localhost:5173)만 허용.

5. **파일 업로드 제한**: 10MB, 지원 형식: text/*, image/*, application/pdf

## 알려진 이슈 / TODO

- [ ] 결제 시스템 (현재 Mock - 크레딧 수동 관리)
- [ ] 이메일 인증
- [ ] 페르소나 수정 기능
- [ ] 피드백 결과 내보내기 (PDF, CSV)
- [ ] E2E 테스트 추가
- [ ] 프로덕션 배포 설정

## 최근 변경사항

### 2026-01-16
- 초기 MVP 구현 완료
- 백엔드: Auth, Users, Personas, Feedback, Upload, AI 모듈
- 프론트엔드: 로그인, 대시보드, 페르소나, 피드백 페이지
- 테스트: 백엔드 45개, 프론트엔드 24개 통과

---

*이 문서는 AI 에이전트가 프로젝트 작업 시 참조하며, 주요 변경사항 발생 시 업데이트합니다.*
