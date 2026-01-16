# Percepta

AI 페르소나 기반 피드백 서비스

## 소개

Percepta는 다양한 AI 페르소나를 통해 콘텐츠에 대한 피드백을 받을 수 있는 서비스입니다. 마케팅 문구, 제품 아이디어, 블로그 글 등을 제출하면 각기 다른 연령대, 직업, 성향을 가진 가상의 페르소나들이 피드백을 제공합니다.

## 주요 기능

- **페르소나 관리**: 연령대, 직업, 성향을 지정하여 AI 페르소나 생성
- **다양한 입력 방식**: 텍스트 직접 입력, 파일 업로드, URL 스크래핑 지원
- **AI 피드백 생성**: Google Gemini를 활용한 페르소나별 피드백
- **종합 분석**: 여러 페르소나의 피드백을 종합한 인사이트 제공
- **크레딧 시스템**: 사용량 기반 크레딧 관리

## 기술 스택

| 영역 | 기술 |
|------|------|
| 모노레포 | pnpm workspace |
| 백엔드 | NestJS + TypeORM |
| 프론트엔드 | React + Vite + Tailwind CSS |
| 데이터베이스 | PostgreSQL (Docker) |
| 인증 | JWT + Google OAuth |
| AI | Google Gemini (추상화 레이어로 다른 AI 지원 가능) |

## 빠른 시작

### 사전 요구사항

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd percepta

# 의존성 설치
pnpm install

# PostgreSQL 실행
docker-compose up -d

# 환경 변수 설정 (로컬 개발용)
cp backend/.env.example backend/.env.local

# 백엔드 실행 (터미널 1)
pnpm --filter backend dev

# 프론트엔드 실행 (터미널 2)
pnpm --filter frontend dev
```

- 백엔드: http://localhost:3000
- 프론트엔드: http://localhost:5173

### 로컬 개발 모드

`backend/.env.local`에서 Mock 모드를 활성화하면 외부 서비스 없이 개발할 수 있습니다:

```env
MOCK_AI=true      # AI API 없이 Mock 응답 사용
MOCK_STORAGE=true # Supabase 없이 로컬 스토리지 사용
```

## 프로젝트 구조

```
percepta/
├── backend/           # NestJS 백엔드
│   └── src/modules/
│       ├── auth/      # 인증 (JWT, Google OAuth)
│       ├── users/     # 사용자 관리
│       ├── personas/  # 페르소나 CRUD
│       ├── feedback/  # 피드백 세션/결과
│       ├── upload/    # 파일 업로드
│       └── ai/        # AI 서비스 (Gemini, Mock)
├── frontend/          # React 프론트엔드
│   └── src/
│       ├── components/
│       ├── pages/
│       └── store/
└── docker-compose.yml
```

## 개발 명령어

```bash
# 테스트 실행
pnpm --filter backend test     # 백엔드 테스트
pnpm --filter frontend test    # 프론트엔드 테스트

# 빌드
pnpm --filter backend build
pnpm --filter frontend build

# Docker
docker-compose up -d           # PostgreSQL 시작
docker-compose down            # PostgreSQL 중지
```

## 환경 변수

`backend/.env.example`을 참조하여 환경 변수를 설정하세요. 주요 설정:

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DATABASE_PORT` | PostgreSQL 포트 | 5432 (로컬: 5434) |
| `JWT_SECRET` | JWT 서명 키 | - |
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | - |
| `GEMINI_API_KEY` | Google Gemini API 키 | - |
| `MOCK_AI` | AI Mock 모드 | false |
| `MOCK_STORAGE` | Storage Mock 모드 | false |

## API 문서

주요 엔드포인트:

- `POST /api/auth/google` - Google OAuth 로그인
- `GET /api/personas` - 페르소나 목록
- `POST /api/personas` - 페르소나 생성
- `POST /api/feedback/sessions` - 피드백 세션 생성
- `POST /api/feedback/sessions/:id/generate` - 피드백 생성

전체 API는 [CLAUDE.md](./CLAUDE.md)를 참조하세요.

## 상세 문서

- [CLAUDE.md](./CLAUDE.md) - 프로젝트 상세 문서 (DB 스키마, API 엔드포인트, 코드 컨벤션 등)

## 라이선스

Private
