# Percepta 배포 가이드

Supabase (DB) + Vercel (프론트엔드) + Railway (백엔드) 조합으로 배포하는 가이드입니다.

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────┐
│  Supabase                                           │
│  - PostgreSQL Database                              │
│  - Storage (파일 업로드)                             │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────┐         ┌───────────────────────┐
│  Vercel          │         │  Railway              │
│  - React 프론트   │ ──API──▶│  - NestJS 백엔드       │
│  - 정적 호스팅    │         │  - 컨테이너 호스팅      │
└──────────────────┘         └───────────────────────┘
```

## 사전 준비

- [GitHub](https://github.com) 계정 (코드 저장소)
- [Supabase](https://supabase.com) 계정
- [Railway](https://railway.app) 계정
- [Vercel](https://vercel.com) 계정
- [Google Cloud Console](https://console.cloud.google.com) 프로젝트 (OAuth용)
- [Google AI Studio](https://aistudio.google.com) API 키 (Gemini용)

---

## 1단계: GitHub 저장소 준비

### 1.1 코드 푸시

```bash
# 이미 GitHub 저장소가 있다면 스킵
git remote add origin https://github.com/YOUR_USERNAME/percepta.git
git push -u origin main
```

---

## 2단계: Supabase 설정

### 2.1 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. **New Project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: `percepta`
   - **Database Password**: 강력한 비밀번호 생성 (저장해둘 것!)
   - **Region**: `Northeast Asia (Seoul)` 또는 가까운 리전
4. **Create new project** 클릭

### 2.2 데이터베이스 연결 정보 확인

1. 프로젝트 생성 완료 후 **Settings** → **Database** 이동
2. **Connection string** 섹션에서 **URI** 복사
3. 또는 개별 정보 확인:
   - **Host**: `db.xxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432` (일반) 또는 `6543` (Pooler - 권장)
   - **User**: `postgres`
   - **Password**: 프로젝트 생성 시 입력한 비밀번호

> **권장**: Connection Pooler 사용 (Settings → Database → Connection Pooling)
> - Mode: `Transaction`
> - Port: `6543`

### 2.3 Storage 버킷 생성 (이미 있다면 스킵)

1. **Storage** 메뉴 이동
2. **New bucket** 클릭
3. 버킷 정보:
   - **Name**: `uploads`
   - **Public bucket**: 체크
4. **Create bucket** 클릭

### 2.4 API 키 확인

1. **Settings** → **API** 이동
2. 다음 값들을 복사해둘 것:
   - **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 3단계: Railway 설정 (백엔드)

### 3.1 프로젝트 생성

1. [Railway Dashboard](https://railway.app/dashboard) 접속
2. **New Project** → **Deploy from GitHub repo** 클릭
3. GitHub 계정 연결 및 `percepta` 저장소 선택
4. **Add variables** 클릭하여 환경 변수 나중에 설정

### 3.2 서비스 설정

1. 생성된 서비스 클릭
2. **Settings** 탭 이동
3. 다음 설정:

**Root Directory**:
```
backend
```

**Build Command** (자동 감지되지 않을 경우):
```bash
npm install && npm run build
```

**Start Command**:
```bash
npm run start:prod
```

### 3.3 환경 변수 설정

**Variables** 탭에서 다음 변수들을 추가:

```env
# Database (Supabase에서 복사)
DATABASE_HOST=db.xxxxxxxxxxxx.supabase.co
DATABASE_PORT=6543
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-supabase-db-password
DATABASE_NAME=postgres

# 프로덕션에서는 SSL 필요
DATABASE_SSL=true

# JWT (강력한 랜덤 문자열 생성)
JWT_SECRET=생성한-강력한-시크릿-키-최소-32자-이상
JWT_EXPIRATION=7d

# Google OAuth (4단계에서 설정)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/auth/google/callback

# Supabase Storage
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_BUCKET=uploads

# AI
MOCK_AI=false
GEMINI_API_KEY=your-gemini-api-key

# App
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app

# Production
NODE_ENV=production
```

> **JWT_SECRET 생성 방법**:
> ```bash
> openssl rand -base64 32
> ```

### 3.4 도메인 설정

1. **Settings** → **Networking** → **Generate Domain** 클릭
2. 생성된 도메인 복사 (예: `percepta-backend-production.up.railway.app`)
3. 또는 **Custom Domain** 설정 가능

### 3.5 배포 확인

1. **Deployments** 탭에서 빌드 로그 확인
2. 배포 완료 후 `https://your-backend.railway.app/api` 접속하여 확인

---

## 4단계: Google OAuth 설정

### 4.1 OAuth 클라이언트 생성

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **APIs & Services** → **Credentials** 이동
4. **Create Credentials** → **OAuth client ID** 클릭

### 4.2 OAuth 동의 화면 설정 (처음인 경우)

1. **OAuth consent screen** 클릭
2. **User Type**: `External` 선택
3. 앱 정보 입력:
   - **App name**: `Percepta`
   - **User support email**: 본인 이메일
   - **Developer contact**: 본인 이메일
4. **Scopes**: `email`, `profile` 추가
5. **Test users**: 테스트할 이메일 추가 (프로덕션 전까지)

### 4.3 OAuth 클라이언트 ID 생성

1. **Create Credentials** → **OAuth client ID**
2. **Application type**: `Web application`
3. **Name**: `Percepta Production`
4. **Authorized JavaScript origins**:
   ```
   https://your-frontend.vercel.app
   ```
5. **Authorized redirect URIs**:
   ```
   https://your-backend.railway.app/api/auth/google/callback
   ```
6. **Create** 클릭
7. **Client ID**와 **Client Secret** 복사

### 4.4 Railway 환경 변수 업데이트

Railway에서 다음 변수 업데이트:
```env
GOOGLE_CLIENT_ID=복사한-클라이언트-ID
GOOGLE_CLIENT_SECRET=복사한-클라이언트-시크릿
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/auth/google/callback
```

---

## 5단계: Vercel 설정 (프론트엔드)

### 5.1 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. **Add New** → **Project** 클릭
3. GitHub 저장소 `percepta` 선택
4. **Import** 클릭

### 5.2 빌드 설정

**Framework Preset**: `Vite`

**Root Directory**:
```
frontend
```

**Build Command** (자동 감지됨):
```bash
npm run build
```

**Output Directory** (자동 감지됨):
```
dist
```

### 5.3 환경 변수 설정

**Environment Variables** 섹션에서:

```env
VITE_API_URL=https://your-backend.railway.app/api
```

### 5.4 배포

1. **Deploy** 클릭
2. 빌드 완료 후 생성된 URL 확인 (예: `percepta.vercel.app`)

### 5.5 도메인 설정 (선택사항)

1. **Settings** → **Domains**
2. 커스텀 도메인 추가 가능

---

## 6단계: 최종 설정 업데이트

### 6.1 Railway 환경 변수 업데이트

Vercel 도메인이 확정되면 Railway에서 업데이트:

```env
FRONTEND_URL=https://percepta.vercel.app
```

### 6.2 Google OAuth 업데이트

Google Cloud Console에서 실제 도메인으로 업데이트:

**Authorized JavaScript origins**:
```
https://percepta.vercel.app
```

### 6.3 Vercel 재배포

환경 변수 변경 후 Vercel에서 재배포:
1. **Deployments** 탭
2. 최신 배포의 **⋮** 메뉴 → **Redeploy**

---

## 7단계: 검증

### 7.1 헬스 체크

```bash
# 백엔드 API 확인
curl https://your-backend.railway.app/api

# 프론트엔드 확인
curl https://percepta.vercel.app
```

### 7.2 기능 테스트

1. 프론트엔드 접속
2. Google 로그인 테스트
3. 페르소나 생성 테스트
4. 피드백 생성 테스트

---

## 트러블슈팅

### 데이터베이스 연결 실패

**증상**: `ECONNREFUSED` 또는 `connection timeout`

**해결**:
1. Supabase에서 Connection Pooler 사용 확인 (포트 6543)
2. `DATABASE_SSL=true` 설정 확인
3. Railway에서 Supabase IP 허용 필요 시 Supabase Settings → Database → Network에서 설정

### CORS 오류

**증상**: `Access-Control-Allow-Origin` 오류

**해결**:
1. Railway에서 `FRONTEND_URL` 정확히 설정 확인
2. 백엔드 CORS 설정 확인 (`app.module.ts` 또는 `main.ts`)

### OAuth 리다이렉트 오류

**증상**: `redirect_uri_mismatch`

**해결**:
1. Google Cloud Console에서 **정확한** redirect URI 등록 확인
2. Railway의 `GOOGLE_CALLBACK_URL`과 일치하는지 확인
3. HTTPS 사용 확인

### Vercel 빌드 실패

**증상**: `VITE_API_URL is not defined`

**해결**:
1. Vercel 환경 변수에 `VITE_API_URL` 추가 확인
2. 재배포 수행

### Railway 빌드 실패

**증상**: `Cannot find module` 또는 빌드 오류

**해결**:
1. Root Directory가 `backend`로 설정되어 있는지 확인
2. `package.json`의 scripts 확인
3. 로컬에서 `npm run build` 테스트

---

## 비용 안내

| 서비스 | 무료 티어 | 예상 비용 (초과 시) |
|--------|----------|-------------------|
| Supabase | 500MB DB, 1GB Storage | $25/월~ |
| Railway | $5/월 크레딧 | 사용량 기반 |
| Vercel | 무제한 (개인) | Pro $20/월 |
| Google OAuth | 무료 | 무료 |
| Gemini API | 무료 티어 있음 | 사용량 기반 |

---

## 프로덕션 체크리스트

- [ ] Supabase 프로젝트 생성 및 DB 연결 정보 확인
- [ ] Supabase Storage 버킷 생성
- [ ] Railway 백엔드 배포 및 환경 변수 설정
- [ ] Google OAuth 클라이언트 생성 및 설정
- [ ] Gemini API 키 발급 및 설정
- [ ] Vercel 프론트엔드 배포
- [ ] FRONTEND_URL, GOOGLE_CALLBACK_URL 최종 업데이트
- [ ] 전체 기능 테스트 (로그인, 페르소나, 피드백)
- [ ] Google OAuth를 "프로덕션" 모드로 전환 (테스트 사용자 제한 해제)

---

## 환경 변수 요약

### Railway (백엔드)

```env
# Database
DATABASE_HOST=db.xxxxxxxxxxxx.supabase.co
DATABASE_PORT=6543
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-password
DATABASE_NAME=postgres
DATABASE_SSL=true

# JWT
JWT_SECRET=your-strong-secret-key
JWT_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/auth/google/callback

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_BUCKET=uploads

# AI
MOCK_AI=false
GEMINI_API_KEY=your-gemini-key

# App
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Vercel (프론트엔드)

```env
VITE_API_URL=https://your-backend.railway.app/api
```
