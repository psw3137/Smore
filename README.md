# Smore Backend API

숏폼 챌린지 통합 큐레이션 플랫폼 백엔드 API

## 📋 개요

Smore는 YouTube Shorts와 TikTok의 챌린지 영상을 통합 검색, 추천하는 플랫폼입니다.

## 🛠 기술 스택

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18+
- **Database:** MySQL 8.0+
- **Language:** JavaScript

## 📦 설치 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 값을 설정합니다:

```bash
cp .env.example .env
```

`.env` 파일 예시:

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smore

YOUTUBE_API_KEY=your_youtube_api_key
```

### 3. 데이터베이스 설정

MySQL에서 스키마를 실행합니다:

```bash
mysql -u root -p < sql/schema.sql
```

또는 MySQL Workbench에서 `sql/schema.sql` 파일을 열어 실행합니다.

### 4. 서버 실행

개발 모드 (nodemon):

```bash
npm run dev
```

프로덕션 모드:

```bash
npm start
```

서버가 성공적으로 시작되면 다음과 같이 표시됩니다:

```
🚀 Smore Backend Server is running on port 3000
📍 Environment: development
🔗 API Base URL: http://localhost:3000/api/v1
💚 Health Check: http://localhost:3000/health
```

## 📡 API 엔드포인트

### 헬스 체크

```
GET /health
```

### 기능 #1: 검색 API

#### 1. 기본 검색

```
GET /api/v1/search?q={검색어}&sort={정렬}&page={페이지}&limit={개수}
```

**파라미터:**
- `q` (필수): 검색 키워드 (2자 이상)
- `sort` (선택): 정렬 방식 (relevance, latest, popular)
- `page` (선택): 페이지 번호 (기본값: 1)
- `limit` (선택): 페이지당 결과 수 (기본값: 20, 최대: 100)

**예시:**

```bash
curl "http://localhost:3000/api/v1/search?q=춤&sort=latest&limit=20"
```

#### 2. 고급 검색

```
GET /api/v1/search/advanced?q={검색어}&category={카테고리}&platform={플랫폼}&...
```

**추가 파라미터:**
- `category`: 카테고리 코드 (dance, lipsync, exercise, cooking, comedy, beauty, gaming, other)
- `platform`: 플랫폼 (youtube, tiktok, all)
- `difficulty`: 난이도 (easy, medium, hard)
- `date_from`: 시작 날짜 (YYYY-MM-DD)
- `date_to`: 종료 날짜 (YYYY-MM-DD)
- `min_views`: 최소 조회수

**예시:**

```bash
curl "http://localhost:3000/api/v1/search/advanced?q=댄스&category=dance&difficulty=easy&date_from=2025-11-01"
```

#### 3. 트렌딩 검색어

```
GET /api/v1/search/trending?limit={개수}&days={기간}
```

**파라미터:**
- `limit` (선택): 반환할 검색어 수 (기본값: 10, 최대: 50)
- `days` (선택): 최근 N일 기준 (기본값: 7, 최대: 30)

**예시:**

```bash
curl "http://localhost:3000/api/v1/search/trending?limit=10&days=7"
```

### 기능 #2: 챌린지 조회 API

#### 1. 챌린지 목록 조회

```
GET /api/v1/challenges?category={카테고리}&platform={플랫폼}&sort={정렬}
```

#### 2. 챌린지 상세 조회

```
GET /api/v1/challenges/:challengeId
```

#### 3. 카테고리별 챌린지 조회

```
GET /api/v1/challenges/category/:categoryId
```

### 기능 #3: 트렌드 분석 API

#### 1. 전체 트렌드 대시보드

```
GET /api/v1/trends?days={기간}
```

#### 2. 일별 트렌드

```
GET /api/v1/trends/daily?date={날짜}
```

#### 3. 카테고리별 트렌드

```
GET /api/v1/trends/category/:categoryId?days={기간}
```

### 기능 #4: 수집 로그 조회 API

```
GET /api/v1/collection-logs?platform={플랫폼}&status={상태}&days={기간}
```

### 기능 #5: 추천 시스템 API

```
GET /api/v1/recommendations?limit={개수}&days={기간}
```

**파라미터:**
- `limit` (선택): 추천 개수 (기본값: 10, 최대: 50)
- `days` (선택): 최근 N일 기준 (기본값: 7, 최대: 30)

**예시:**

```bash
curl "http://localhost:3000/api/v1/recommendations?limit=20&days=7"
```

## 📁 프로젝트 구조

```
Smore/
├── src/
│   ├── api/                       # 외부 API 클라이언트
│   ├── config/                    # 설정 파일
│   │   ├── database.js            # MySQL 연결
│   │   └── constants.js           # 상수 정의
│   ├── controllers/               # 요청 처리
│   │   ├── searchController.js
│   │   ├── challengeController.js
│   │   ├── trendController.js
│   │   ├── collectionController.js
│   │   └── recommendationController.js
│   ├── services/                  # 비즈니스 로직
│   │   ├── searchService.js
│   │   ├── challengeService.js
│   │   ├── trendService.js
│   │   ├── collectionService.js
│   │   └── recommendationService.js
│   ├── models/                    # 데이터베이스 쿼리
│   │   ├── Challenge.js
│   │   ├── Category.js
│   │   ├── Tag.js
│   │   ├── Trend.js
│   │   └── CollectionLog.js
│   ├── middleware/                # 미들웨어
│   │   ├── errorHandler.js
│   │   ├── responseFormatter.js
│   │   └── logger.js
│   ├── routes/                    # 라우터
│   │   ├── searchRoutes.js
│   │   ├── challengeRoutes.js
│   │   ├── trendRoutes.js
│   │   ├── collectionRoutes.js
│   │   ├── recommendationRoutes.js
│   │   └── index.js
│   ├── utils/                     # 유틸리티
│   ├── batch/                     # 배치 작업
│   └── app.js                     # Express 앱 설정
├── sql/
│   └── schema.sql                 # 데이터베이스 스키마
├── .env.example                   # 환경 변수 예시
├── .gitignore
├── package.json
├── server.js                      # 진입점
└── README.md
```

## 🔄 응답 포맷

### 성공 응답

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "검색이 완료되었습니다",
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-27T15:30:00Z",
    "version": "1.0"
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "code": "INVALID_QUERY",
  "message": "검색어는 2자 이상이어야 합니다",
  "errors": [
    {
      "field": "q",
      "message": "검색어 길이가 너무 짧습니다"
    }
  ],
  "meta": {
    "timestamp": "2025-11-27T15:30:00Z",
    "version": "1.0"
  }
}
```

## 🧪 테스트

Postman, curl 또는 브라우저를 사용하여 API를 테스트할 수 있습니다.

**예시 (curl):**

```bash
# 헬스 체크
curl http://localhost:3000/health

# 기본 검색
curl "http://localhost:3000/api/v1/search?q=춤&sort=latest"

# 트렌딩 검색어
curl "http://localhost:3000/api/v1/search/trending"
```

## 📝 개발 현황

### ✅ 완료된 기능

- [x] 프로젝트 초기화 및 폴더 구조
- [x] MySQL 데이터베이스 연결
- [x] 기본 미들웨어 (응답 포맷팅, 에러 처리, 로깅)
- [x] 기능 #1: 검색 API (기본 검색, 고급 검색, 트렌딩 검색어)
- [x] 기능 #2: 챌린지 조회 API (목록, 상세, 카테고리별)
- [x] 기능 #3: 트렌드 분석 API (전체 트렌드, 일별, 카테고리별)
- [x] 기능 #4: 수집 로그 조회 API
- [x] 기능 #5: 추천 시스템 API (트렌드 기반)

### 🚧 개발 예정

- [ ] YouTube API 연동 (데이터 수집 배치 작업)
- [ ] TikTok API 연동 (선택사항)
- [ ] 배치 스케줄러 구현

## 🤝 기여

박선우

## 📄 라이선스

ISC

## 📞 문의

문제가 발생하거나 질문이 있으시면 Issues를 통해 문의해주세요.