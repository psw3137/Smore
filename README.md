# Smore - 숏폼 챌린지 큐레이션 플랫폼

> YouTube Shorts 챌린지 영상을 발견하고 즐기는 모바일 앱 플랫폼

## 📋 프로젝트 개요

Smore는 YouTube Shorts의 다양한 챌린지 영상을 카테고리별로 분류하고, 트렌드를 분석하여 사용자에게 최적의 챌린지를 추천하는 통합 큐레이션 플랫폼입니다.

### 주요 기능

- **챌린지 탐색**: 8개 카테고리(댄스, 립싱크, 운동, 요리, 코미디, 뷰티, 게임, 기타)별 영상 제공
- **Shorts 스타일 시청**: 세로 스와이프로 자연스러운 영상 전환
- **검색 & 필터링**: 키워드 검색 및 정렬(인기순, 최신순, 관련성)
- **트렌드 분석**: 기간별 인기 챌린지 및 카테고리 통계 제공
- **북마크**: 마음에 드는 챌린지 저장 및 관리
- **YouTube 연동**: 원본 영상으로 바로 이동

## 🛠 기술 스택

### 백엔드

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Database**: MySQL 8.0+
- **API Integration**: YouTube Data API v3
- **Language**: JavaScript

### 모바일 앱

- **Framework**: React Native (Expo)
- **Navigation**: React Navigation 6.x
- **Video Player**: react-native-youtube-iframe
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **UI**: React Native Paper (일부 컴포넌트)

## 📦 설치 및 실행

### 사전 준비

- Node.js 18 이상
- MySQL 8.0 이상
- YouTube Data API Key
- Expo Go 앱 (모바일 테스트용)

### 백엔드 설정

#### 1. 의존성 설치

```bash
npm install
```

#### 2. 환경 변수 설정

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

#### 3. 데이터베이스 설정

MySQL에서 스키마를 실행합니다:

```bash
mysql -u root -p < MySQL_schema.sql
```

또는 MySQL Workbench에서 `MySQL_schema.sql` 파일을 열어 실행합니다.

#### 4. 초기 데이터 수집

YouTube API를 통해 한국 Shorts 영상을 수집합니다:

```bash
node clear-and-collect.js
```

이 스크립트는:
- 기존 챌린지 데이터 삭제
- 240개의 한국어 YouTube Shorts 수집
- 8개 카테고리별로 자동 분류
- 태그 및 메타데이터 저장

#### 5. 백엔드 서버 실행

개발 모드:

```bash
npm run dev
```

프로덕션 모드:

```bash
npm start
```

서버가 성공적으로 시작되면:

```
🚀 Smore Backend Server is running on port 3000
📍 Environment: development
🔗 API Base URL: http://localhost:3000/api/v1
💚 Health Check: http://localhost:3000/health
```

### 모바일 앱 설정

#### 1. 모바일 디렉토리로 이동

```bash
cd mobile
```

#### 2. 의존성 설치

```bash
npm install
```

#### 3. API 서버 주소 설정

`mobile/src/services/api.js` 파일에서 백엔드 서버 주소를 설정합니다:

```javascript
const API_BASE_URL = 'http://192.168.x.x:3000/api/v1'; // 로컬 IP 주소로 변경
```

> **Note**: 실제 디바이스에서 테스트하려면 컴퓨터의 로컬 IP 주소를 사용해야 합니다.

#### 4. 모바일 앱 실행

```bash
npx expo start
```

Expo Go 앱에서 QR 코드를 스캔하여 실행합니다.

## 🚀 배포

### APK 빌드 및 배포

과제 제출이나 실제 기기 배포를 위해 APK를 빌드하려면 다음 가이드를 참고하세요:

#### 백엔드 배포 (Railway)

Railway를 사용하여 무료로 백엔드 서버를 배포할 수 있습니다:

1. **배포 가이드 확인**: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) 참고
2. **Railway 계정 생성**: https://railway.app
3. **GitHub 연동** 및 프로젝트 배포
4. **MySQL 플러그인 추가** 및 환경 변수 설정
5. **생성된 Railway URL 복사**

#### 모바일 앱 빌드

1. **프로덕션 API URL 설정**:

   `mobile/eas.json` 파일에서 Railway URL 입력:
   ```json
   {
     "build": {
       "production": {
         "env": {
           "API_URL": "https://your-app.up.railway.app/api/v1"
         }
       }
     }
   }
   ```

2. **APK 빌드**:
   ```bash
   cd mobile
   npm run build:production
   ```

3. **APK 다운로드**:
   - 빌드 완료 후 EAS 대시보드에서 다운로드
   - 또는 터미널에 표시된 링크에서 다운로드

자세한 내용은 다음 문서를 참고하세요:
- [Railway 배포 가이드](./RAILWAY_DEPLOYMENT.md)
- [모바일 배포 가이드](./mobile/DEPLOYMENT_GUIDE.md)
- [빌드 가이드](./mobile/BUILD_GUIDE.md)

## 📁 프로젝트 구조

```
Smore/
├── src/                                # 백엔드 소스
│   ├── api/
│   │   └── youtubeClient.js            # YouTube API 클라이언트
│   ├── batch/
│   │   └── collectYouTubeChallenges.js # 데이터 수집 배치
│   ├── config/
│   │   ├── database.js                 # MySQL 연결
│   │   └── constants.js                # 상수 정의
│   ├── controllers/                    # 컨트롤러 레이어
│   │   ├── challengeController.js
│   │   ├── searchController.js
│   │   ├── trendController.js
│   │   ├── categoryController.js
│   │   ├── collectionController.js
│   │   └── recommendationController.js
│   ├── services/                       # 비즈니스 로직
│   │   ├── challengeService.js
│   │   ├── searchService.js
│   │   ├── trendService.js
│   │   ├── collectionService.js
│   │   └── recommendationService.js
│   ├── models/                         # 데이터 액세스 레이어
│   │   ├── Challenge.js
│   │   ├── Category.js
│   │   ├── Tag.js
│   │   ├── Trend.js
│   │   └── CollectionLog.js
│   ├── middleware/                     # 미들웨어
│   │   ├── errorHandler.js
│   │   ├── responseFormatter.js
│   │   └── logger.js
│   ├── routes/                         # API 라우트
│   │   ├── index.js
│   │   ├── challengeRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── searchRoutes.js
│   │   ├── trendRoutes.js
│   │   ├── collectionRoutes.js
│   │   └── recommendationRoutes.js
│   └── app.js                          # Express 앱
│
├── mobile/                             # 모바일 앱 소스
│   ├── src/
│   │   ├── components/                 # 재사용 가능 컴포넌트
│   │   │   ├── ChallengeCard.js        # 챌린지 카드 (React.memo 최적화)
│   │   │   ├── GradientHeader.js       # 공통 그라데이션 헤더
│   │   │   ├── ListStates.js           # 로딩/빈 상태/에러 상태
│   │   │   ├── ChallengeGrid.js        # 챌린지 그리드 레이아웃
│   │   │   ├── CategoryRankingRow.js   # 트렌드 순위 행
│   │   │   ├── StatCard.js             # 통계 카드
│   │   │   └── SplashScreen.js         # 스플래시 화면
│   │   ├── navigation/
│   │   │   └── RootNavigator.js        # 탭 네비게이션
│   │   ├── screens/                    # 화면 컴포넌트
│   │   │   ├── HomeScreen.js           # 홈 (피드)
│   │   │   ├── CategoryScreen.js       # 카테고리 탐색
│   │   │   ├── SearchScreen.js         # 검색
│   │   │   ├── TrendScreen.js          # 트렌드 분석
│   │   │   ├── ProfileScreen.js        # 프로필 (북마크)
│   │   │   └── ChallengeDetailScreen.js # 영상 재생
│   │   ├── services/
│   │   │   ├── api.js                  # API 클라이언트
│   │   │   └── storage.js              # AsyncStorage 서비스
│   │   ├── utils/                      # 유틸리티 함수
│   │   │   ├── formatters.js           # 숫자/날짜 포맷팅
│   │   │   ├── youtube.js              # YouTube URL 처리
│   │   │   └── errorHandler.js         # 에러 처리
│   │   ├── constants/                  # 상수
│   │   │   └── app.js                  # 앱 전역 상수
│   │   └── theme/                      # 디자인 시스템
│   │       ├── colors.js
│   │       ├── spacing.js
│   │       └── typography.js
│   ├── assets/                         # 이미지/아이콘
│   ├── App.js
│   ├── app.json                        # Expo 설정
│   ├── eas.json                        # EAS Build 설정
│   ├── package.json
│   └── BUILD_GUIDE.md                  # APK 빌드 가이드
│
├── MySQL_schema.sql                    # 데이터베이스 스키마
├── clear-and-collect.js                # 데이터 수집 스크립트
├── .env.example
├── package.json
├── server.js
└── README.md
```

## 📡 API 엔드포인트

### 헬스 체크

```
GET /health
```

### 챌린지 API

```
GET /api/v1/challenges                      # 전체 챌린지 목록
GET /api/v1/challenges/:id                  # 챌린지 상세
GET /api/v1/challenges/category/:categoryId # 카테고리별 챌린지
```

**쿼리 파라미터:**
- `sort`: 정렬 방식 (latest, popular, relevance)
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 개수 (기본값: 20, 최대: 100)

### 검색 API

```
GET /api/v1/search?q={검색어}               # 기본 검색
GET /api/v1/search/advanced                 # 고급 검색
GET /api/v1/search/trending                 # 트렌딩 키워드
```

**고급 검색 파라미터:**
- `category`: 카테고리 코드
- `platform`: 플랫폼 (youtube, tiktok, all)
- `date_from`: 시작 날짜
- `date_to`: 종료 날짜
- `min_views`: 최소 조회수

### 트렌드 API

```
GET /api/v1/trends?days={기간}              # 전체 트렌드
GET /api/v1/trends/daily?date={날짜}        # 일별 트렌드
GET /api/v1/trends/category/:id?days={기간} # 카테고리별 트렌드
```

### 카테고리 API

```
GET /api/v1/categories                      # 카테고리 목록
GET /api/v1/categories/:id                  # 카테고리 상세
```

### 추천 API

```
GET /api/v1/recommendations?limit={개수}&days={기간}
```

## 🔄 API 응답 포맷

### 성공 응답

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "요청이 성공했습니다",
  "data": {
    "challenges": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 240,
      "has_next": true,
      "has_prev": false
    }
  },
  "meta": {
    "timestamp": "2025-12-05T10:00:00Z",
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
      "message": "검색어 길이가 너무 짧습니다",
      "received": "a"
    }
  ],
  "meta": {
    "timestamp": "2025-12-05T10:00:00Z",
    "version": "1.0"
  }
}
```

## 🎨 주요 화면

### 홈 (피드)
- 최신/인기 챌린지 그리드 뷰
- 카테고리 필터
- 정렬 옵션 (최신순/인기순)
- 무한 스크롤 페이지네이션

### 카테고리
- 8개 카테고리 선택 화면
- 카테고리별 챌린지 목록

### 검색
- 키워드 검색
- 트렌딩 검색어 표시
- 정렬 옵션 (관련성/최신순/인기순)

### 트렌드
- 기간별 통계 (7일/14일/30일)
- 조회수, 좋아요, 챌린지 수
- 인기 카테고리 TOP 5
- 급상승 챌린지 TOP 10

### 프로필
- 북마크한 챌린지 관리
- 저장 개수 표시

### 챌린지 상세
- YouTube Shorts 스타일 세로 영상
- 세로 스와이프로 다음/이전 영상
- 북마크 저장
- YouTube 앱에서 보기
- 조회수, 채널명, 제목 표시

## 📊 데이터베이스 스키마

### 주요 테이블

- **categories**: 챌린지 카테고리 (8개)
- **challenges**: 챌린지 영상 정보
- **tags**: 태그 목록
- **challenge_tags**: 챌린지-태그 매핑
- **trends_daily**: 일별 트렌드 데이터 (선택적)
- **collection_logs**: 데이터 수집 로그

## 📝 개발 현황

### ✅ 완료된 기능

#### 백엔드
- [x] Express.js 기반 RESTful API
- [x] MySQL 데이터베이스 연결 및 스키마
- [x] YouTube Data API 연동
- [x] 한국 Shorts 영상 자동 수집 (240개, 8개 카테고리)
- [x] 챌린지 CRUD API
- [x] 검색 API (기본, 고급, 트렌딩 키워드)
- [x] 트렌드 분석 API (기간별, 카테고리별)
- [x] 추천 시스템 API
- [x] 에러 처리 미들웨어
- [x] 응답 포맷팅 미들웨어
- [x] 로깅 미들웨어

#### 모바일
- [x] React Native (Expo) 앱 구조
- [x] 탭 네비게이션 (5개 화면)
- [x] 홈 피드 (그리드 뷰, 무한 스크롤)
- [x] 카테고리 탐색 화면
- [x] 검색 화면 (키워드, 트렌딩)
- [x] 트렌드 분석 대시보드
- [x] 프로필 & 북마크 관리
- [x] YouTube Shorts 스타일 영상 재생
- [x] 세로 스와이프 영상 전환
- [x] 북마크 기능 (AsyncStorage)
- [x] YouTube 앱 연동
- [x] 일관된 디자인 시스템 (colors, spacing, typography)

### ✅ 최근 완료된 개선 사항

#### 모바일 앱 최적화 (2024-12)
- [x] **코드 중복 제거**
  - formatNumber, getYoutubeVideoId 함수 → utils 폴더로 분리
  - 중복된 로딩/빈 상태 렌더링 제거

- [x] **재사용 컴포넌트 생성**
  - GradientHeader: 공통 헤더 컴포넌트
  - ListStates: 로딩/빈 상태/에러 상태 통합
  - ChallengeGrid: 2열 그리드 레이아웃

- [x] **성능 최적화**
  - ChallengeCard에 React.memo 적용
  - 이미지 캐싱 설정 (`cache="force-cache"`)
  - 상수 관리 체계화 (constants/app.js)

- [x] **UX 개선**
  - 재생 화면: 화면 터치 시 UI 토글, 3초 후 자동 숨김
  - 그라데이션 최적화: 잘림 현상 제거
  - 부드러운 페이드 애니메이션 적용

- [x] **빌드 환경 구축**
  - app.json APK 빌드 설정 완료
  - eas.json EAS Build 프로파일 설정
  - package.json 빌드 스크립트 추가
  - BUILD_GUIDE.md 작성

### 🔧 개선 필요 사항

#### 백엔드
- [ ] 검증 로직 중복 제거 (`src/utils/validators.js` 생성)
- [ ] N+1 쿼리 최적화 (태그 배치 조회)
- [ ] WHERE 조건 빌더 통합 (`src/utils/queryBuilder.js`)
- [ ] 에러 처리 일관성 (`AppError` 클래스)
- [ ] 임시값 하드코딩 제거 (트렌드 점수 등)
- [ ] 배치 스케줄러 구현 (정기적 데이터 갱신)

#### 모바일
- [ ] 커스텀 Hook 구현 (usePagination, useBookmark)
- [ ] HomeScreen, SearchScreen 리렌더링 최적화 (useCallback, useMemo)
- [ ] FlatList 성능 최적화 (getItemLayout)

### 🚀 향후 계획

- [ ] 사용자 인증 및 계정 관리
- [ ] 소셜 기능 (댓글, 좋아요, 공유)
- [ ] 챌린지 참여 인증 (영상 업로드)
- [ ] AI 기반 개인화 추천
- [ ] TikTok API 연동 (선택사항)
- [ ] 푸시 알림 (새 트렌드, 북마크 업데이트)
- [ ] 앱 배포 (Google Play Store / Apple App Store)

## 🧪 테스트

### 백엔드 API 테스트

```bash
# 헬스 체크
curl http://localhost:3000/health

# 챌린지 목록
curl "http://localhost:3000/api/v1/challenges?sort=latest&limit=20"

# 카테고리별 챌린지
curl "http://localhost:3000/api/v1/challenges/category/1?sort=popular"

# 검색
curl "http://localhost:3000/api/v1/search?q=댄스&sort=relevance"

# 트렌드
curl "http://localhost:3000/api/v1/trends?days=7"
```

### 모바일 앱 테스트

1. Expo Go 앱 설치 (iOS/Android)
2. `npx expo start` 실행
3. QR 코드 스캔
4. 각 탭 기능 테스트

## 📈 코드 품질 분석

### 백엔드 코드 품질: 65/100
- 구조: 85/100 (MVC 패턴 준수)
- 중복 제거: 45/100 (검증 로직 중복)
- 성능: 60/100 (N+1 쿼리 문제)
- 에러 처리: 55/100 (일관성 부족)
- 문서화: 40/100 (주석 부족)

### 모바일 코드 품질: 70/100
- 구조: 80/100 (컴포넌트 기반)
- 재사용성: 55/100 (스타일 중복)
- 성능: 65/100 (메모이제이션 부족)
- 사용자 경험: 85/100
- 코드 일관성: 75/100

> 상세한 분석 결과는 개발팀에서 관리하는 문서를 참고하세요.

## 🤝 기여자

- **박선우** - 프로젝트 기획, 백엔드 & 프론트엔드 개발

## 📄 라이선스

ISC

## 📞 문의

문제 발생 시 GitHub Issues를 통해 문의해주세요.

---

**Last Updated**: 2025-12-05
