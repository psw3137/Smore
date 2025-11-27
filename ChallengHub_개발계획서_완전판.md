# 🎬 ChallengHub 백엔드 개발 계획서

**버전:** 1.0  
**작성일:** 2025-11-27  
**대상:** AI Agent (Claude Code), 백엔드 개발팀  
**목적:** 5개 기능의 통합 백엔드 개발 작업 정의 및 추적  
**예상 기간:** 4주  
**기술 스택:** Node.js + Express.js + MySQL  

---

## 📋 목차

1. [개요 및 아키텍처](#1-개요-및-아키텍처)
2. [MySQL 데이터베이스 설계](#2-mysql-데이터베이스-설계)
3. [API 엔드포인트 전체 설계](#3-api-엔드포인트-전체-설계)
4. [기능별 데이터 파이프라인](#4-기능별-데이터-파이프라인)
5. [백엔드 개발 태스크 체크리스트](#5-백엔드-개발-태스크-체크리스트)
6. [기능별 상세 설계](#6-기능별-상세-설계)
7. [데이터 모델 및 관계도](#7-데이터-모델-및-관계도)
8. [프로젝트 폴더 구조](#8-프로젝트-폴더-구조)
9. [주차별 개발 스케줄](#9-주차별-개발-스케줄)
10. [기능 간 연동 설계](#10-기능-간-연동-설계)

---

## 1. 개요 및 아키텍처

### 1.1 프로젝트 개요

**프로젝트명:** ChallengHub - 숏폼 챌린지 통합 큐레이션 플랫폼 백엔드  
**개발 규모:** 5개 핵심 기능 구현  
**개발 인원:** 1명 (AI Agent 자동 개발)  
**개발 기간:** 4주  

**핵심 기능:**
| 번호 | 기능명 | 설명 | 우선순위 |
|------|--------|------|---------|
| #1 | 챌린지 검색 | 키워드/필터 기반 통합 검색 | 상 |
| #2 | 챌린지 조회 | 카테고리별, 플랫폼별 목록 조회 | 상 |
| #3 | 트렌드 분석 | 실시간 인기 순위 및 통계 | 상 |
| #4 | 뉴스/정보 수집 | YouTube/TikTok 데이터 수집 | 상 |
| #5 | 추천 시스템 | 트렌드 기반 챌린지 추천 | 중 |

---

### 1.2 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│         React Native Mobile App (프론트엔드)        │
│  • 검색, 목록, 상세, 북마크, 트렌드 화면           │
│  • AsyncStorage에 로컬 데이터 저장                  │
└────────────────────┬────────────────────────────────┘
                     │ (HTTP REST API)
                     ↓
┌─────────────────────────────────────────────────────┐
│         Express.js Server (Node.js)                 │
│  ┌──────────────────────────────────────────────┐  │
│  │ API 라우터 (routes/)                          │  │
│  │ - /api/v1/search                             │  │
│  │ - /api/v1/challenges                         │  │
│  │ - /api/v1/trends                             │  │
│  │ - /api/v1/news                               │  │
│  │ - /api/v1/recommendations                    │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ 컨트롤러 (controllers/)                       │  │
│  │ - 요청 처리, 유효성 검증, 응답 포맷팅        │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ 서비스 계층 (services/)                       │  │
│  │ - 비즈니스 로직, 데이터 처리                  │  │
│  │ - 정규화, 캐테고리 분류, 정렬               │  │
│  └──────────────────────────────────────────────┘  │
│                      ↓                              │
│  ┌──────────────────────────────────────────────┐  │
│  │ API 클라이언트 (api/)                         │  │
│  │ - YouTube Data API v3                        │  │
│  │ - TikTok API (선택)                          │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────┘
                   ↓
         ┌─────────────────┐
         │    MySQL DB     │
         │  (챌린지 데이터)│
         │  (메타 데이터)  │
         └─────────────────┘
```

### 1.3 기술 스택

```
런타임: Node.js 18+ LTS
프레임워크: Express.js 4.18+
언어: JavaScript (또는 TypeScript 옵션)
데이터베이스: MySQL 8.0+
ORM: Sequelize 또는 mysql2 (쿼리 빌더)
환경 관리: dotenv
API 클라이언트: axios
로깅: console (개발 단계)
```

### 1.4 개발 팀 구성

| 역할 | 담당자 | 책임 범위 |
|------|--------|----------|
| **백엔드 아키텍트** | Claude Code (AI) | 전체 백엔드 설계, 구현, 최적화 |
| **프론트엔드** | 박선우 | API 연동, UI/UX 구현 (Figma 후 통합) |

---

## 2. MySQL 데이터베이스 설계

### 2.1 데이터베이스 다이어그램

```
┌──────────────────┐
│  challenges      │ (YouTube/TikTok 챌린지 데이터)
├──────────────────┤
│ challenge_id (PK)│
│ platform         │
│ video_id         │
│ title            │
│ description      │
│ thumbnail_url    │
│ channel_name     │
│ view_count       │
│ like_count       │
│ category_id (FK) │
│ difficulty       │
│ collected_at     │
│ updated_at       │
└──────────────────┘
         │
         ├──→ ┌──────────────────┐
         │    │  categories      │
         │    │  (카테고리)      │
         │    ├──────────────────┤
         │    │ category_id (PK) │
         │    │ category_name    │
         │    │ icon_url         │
         │    └──────────────────┘
         │
         └──→ ┌──────────────────────┐
              │  challenge_tags      │
              │  (챌린지 태그 연결)  │
              ├──────────────────────┤
              │ challenge_tag_id (PK)│
              │ challenge_id (FK)    │
              │ tag_id (FK)          │
              └──────────────────────┘
                     │
                     └──→ ┌──────────────────┐
                          │  tags            │
                          │  (해시태그)      │
                          ├──────────────────┤
                          │ tag_id (PK)      │
                          │ tag_name         │
                          │ usage_count      │
                          └──────────────────┘

┌──────────────────────┐
│  trends_daily        │ (일별 트렌드 데이터)
├──────────────────────┤
│ trend_id (PK)        │
│ trend_date           │
│ category_id (FK)     │
│ top_challenges       │ (JSON)
│ avg_view_count       │
│ total_challenges     │
│ score                │
│ created_at           │
└──────────────────────┘

┌──────────────────────┐
│  collection_logs     │ (API 수집 로그)
├──────────────────────┤
│ log_id (PK)          │
│ platform             │
│ collection_date      │
│ total_collected      │
│ total_new            │
│ status               │
│ error_message        │
├──────────────────────┤
│ created_at           │
└──────────────────────┘
```

### 2.2 MySQL 테이블 설계

#### 🔹 테이블 1: categories (카테고리)

```sql
CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '카테고리 코드 (dance, lipsync 등)',
  description VARCHAR(500),
  icon_url VARCHAR(500),
  weight INT DEFAULT 1 COMMENT '트렌드 계산 시 가중치',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_active (is_active),
  INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='챌린지 카테고리';
```

**Sample Data:**
```sql
INSERT INTO categories (category_name, category_code, description, icon_url, weight, display_order) VALUES
('댄스', 'dance', '춤 관련 챌린지', 'https://...', 1, 1),
('립싱크', 'lipsync', '입술싱크 챌린지', 'https://...', 1, 2),
('운동', 'exercise', '피트니스 챌린지', 'https://...', 1, 3),
('요리', 'cooking', '요리 관련 챌린지', 'https://...', 1, 4),
('코미디', 'comedy', '재미있는 챌린지', 'https://...', 1, 5),
('뷰티', 'beauty', '뷰티/메이크업 챌린지', 'https://...', 1, 6),
('게임', 'gaming', '게임 관련 챌린지', 'https://...', 1, 7),
('기타', 'other', '기타 카테고리', 'https://...', 1, 8);
```

---

#### 🔹 테이블 2: tags (해시태그)

```sql
CREATE TABLE tags (
  tag_id INT PRIMARY KEY AUTO_INCREMENT,
  tag_name VARCHAR(100) NOT NULL UNIQUE,
  tag_normalized VARCHAR(100) NOT NULL UNIQUE COMMENT '정규화된 태그명 (검색용)',
  usage_count INT DEFAULT 0,
  category_id INT COMMENT '주 카테고리',
  is_trending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  INDEX idx_normalized (tag_normalized),
  INDEX idx_trending (is_trending),
  INDEX idx_usage (usage_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='해시태그';
```

---

#### 🔹 테이블 3: challenges (챌린지 데이터)

```sql
CREATE TABLE challenges (
  challenge_id INT PRIMARY KEY AUTO_INCREMENT,
  platform ENUM('youtube', 'tiktok') NOT NULL,
  video_id VARCHAR(255) NOT NULL UNIQUE COMMENT '플랫폼의 비디오 ID',
  title VARCHAR(500) NOT NULL,
  description LONGTEXT,
  thumbnail_url VARCHAR(500),
  channel_name VARCHAR(255),
  channel_url VARCHAR(500),
  video_url VARCHAR(500),
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  share_count INT DEFAULT 0,
  upload_date DATETIME,
  duration_seconds INT COMMENT '영상 길이 (초)',
  
  -- 분류 정보
  primary_category_id INT,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  
  -- 메타데이터
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE COMMENT '수동 검증 여부',
  collection_source VARCHAR(100) COMMENT '수집 경로 (API, manual)',
  
  -- 타임스탬프
  collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (primary_category_id) REFERENCES categories(category_id),
  INDEX idx_platform (platform),
  INDEX idx_category (primary_category_id),
  INDEX idx_collected (collected_at),
  INDEX idx_views (view_count),
  INDEX idx_trending (upload_date, view_count),
  UNIQUE KEY uk_platform_video (platform, video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='챌린지 데이터';
```

---

#### 🔹 테이블 4: challenge_tags (챌린지-태그 연결)

```sql
CREATE TABLE challenge_tags (
  challenge_tag_id INT PRIMARY KEY AUTO_INCREMENT,
  challenge_id INT NOT NULL,
  tag_id INT NOT NULL,
  confidence DECIMAL(3, 2) COMMENT '태그 신뢰도 (0.0~1.0)',
  added_by ENUM('auto', 'manual') DEFAULT 'auto',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE,
  UNIQUE KEY uk_challenge_tag (challenge_id, tag_id),
  INDEX idx_challenge (challenge_id),
  INDEX idx_tag (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='챌린지-태그 연결';
```

---

#### 🔹 테이블 5: trends_daily (일별 트렌드)

```sql
CREATE TABLE trends_daily (
  trend_id INT PRIMARY KEY AUTO_INCREMENT,
  trend_date DATE NOT NULL,
  category_id INT,
  
  -- 트렌드 데이터
  top_10_challenges JSON COMMENT '[{challenge_id, rank, score}, ...]',
  top_tags JSON COMMENT '[{tag, count}, ...]',
  avg_view_count DECIMAL(15, 2),
  total_challenges_count INT,
  total_views BIGINT,
  trend_score INT COMMENT '전체 트렌드 점수 (0-100)',
  
  -- 비교 데이터
  compared_to_previous_day DECIMAL(5, 2) COMMENT '전일 대비 변화율 (%)',
  compared_to_previous_week DECIMAL(5, 2) COMMENT '전주 대비 변화율 (%)',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_date_category (trend_date, category_id),
  INDEX idx_date (trend_date),
  INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='일별 트렌드 데이터';
```

---

#### 🔹 테이블 6: collection_logs (API 수집 로그)

```sql
CREATE TABLE collection_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  platform ENUM('youtube', 'tiktok') NOT NULL,
  collection_type ENUM('full', 'incremental') COMMENT '전체/증분 수집',
  collection_date DATETIME NOT NULL,
  
  -- 수집 결과
  total_collected INT DEFAULT 0 COMMENT '수집한 총 개수',
  total_new INT DEFAULT 0 COMMENT '신규 추가 개수',
  total_updated INT DEFAULT 0 COMMENT '업데이트된 개수',
  total_duplicate INT DEFAULT 0 COMMENT '중복 개수',
  
  -- 상태
  status ENUM('success', 'partial', 'failed') DEFAULT 'success',
  error_message LONGTEXT,
  execution_time_seconds INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_platform (platform),
  INDEX idx_date (collection_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='API 수집 로그';
```

---

### 2.3 데이터베이스 초기화 스크립트

```sql
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS challengehub 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE challengehub;

-- 테이블 생성은 위의 각 테이블 CREATE 문 실행

-- 초기 카테고리 데이터
INSERT INTO categories (category_name, category_code, description, weight, display_order) VALUES
('댄스', 'dance', '춤 관련 챌린지', 10, 1),
('립싱크', 'lipsync', '입술싱크 챌린지', 8, 2),
('운동', 'exercise', '피트니스 챌린지', 9, 3),
('요리', 'cooking', '요리 관련 챌린지', 7, 4),
('코미디', 'comedy', '재미있는 챌린지', 8, 5),
('뷰티', 'beauty', '뷰티/메이크업 챌린지', 7, 6),
('게임', 'gaming', '게임 관련 챌린지', 6, 7),
('기타', 'other', '기타 카테고리', 5, 8);
```

---

## 3. API 엔드포인트 전체 설계

### 3.1 API 버전 및 기본 정보

```
API Base URL: http://localhost:3000/api/v1
API 버전: v1
응답 형식: JSON
인증: 없음 (공개 API)
Rate Limiting: 없음 (개발 단계)
```

### 3.2 공통 응답 포맷

**성공 응답 (200, 201):**
```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "작업이 성공적으로 완료되었습니다",
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-27T10:30:00Z",
    "version": "1.0"
  }
}
```

**에러 응답 (400, 404, 500):**
```json
{
  "success": false,
  "code": "INVALID_REQUEST",
  "message": "잘못된 요청입니다",
  "errors": [
    {
      "field": "query",
      "message": "검색어는 2자 이상이어야 합니다"
    }
  ],
  "meta": {
    "timestamp": "2025-11-27T10:30:00Z",
    "version": "1.0"
  }
}
```

---

### 3.3 API 엔드포인트 요약

| 기능 | HTTP | 엔드포인트 | 설명 |
|------|------|----------|------|
| #1 검색 | GET | `/search` | 통합 검색 |
| #1 검색 | GET | `/search/advanced` | 고급 검색 |
| #1 검색 | GET | `/search/trending` | 트렌딩 검색어 |
| #2 조회 | GET | `/challenges` | 챌린지 목록 조회 |
| #2 조회 | GET | `/challenges/{id}` | 챌린지 상세 조회 |
| #2 조회 | GET | `/challenges/category/{categoryId}` | 카테고리별 조회 |
| #3 트렌드 | GET | `/trends` | 트렌드 대시보드 |
| #3 트렌드 | GET | `/trends/daily` | 일별 트렌드 |
| #3 트렌드 | GET | `/trends/category/{categoryId}` | 카테고리별 트렌드 |
| #4 수집 | GET | `/collection-logs` | 수집 로그 조회 |
| #5 추천 | GET | `/recommendations` | 트렌드 기반 추천 |

**총 11개 엔드포인트**

---

## 4. 기능별 데이터 파이프라인

### 4.1 기능 #1: 챌린지 검색

```
사용자 입력
  ↓
GET /search?q={keyword}&sort={sort}&limit={limit}
  ↓
SearchController.search()
  ↓
SearchService.searchChallenges()
  ├─→ 데이터베이스 쿼리
  │  ├─→ LIKE 검색 (제목, 설명)
  │  ├─→ 해시태그 매칭
  │  └─→ 채널명 검색
  ├─→ 결과 정렬 (최신순, 인기순, 관련도순)
  ├─→ 페이지네이션
  └─→ 응답 포맷팅
  ↓
JSON 응답
  ↓
프론트엔드 화면 렌더링
```

### 4.2 기능 #2: 챌린지 목록 조회

```
사용자 카테고리/플랫폼 선택
  ↓
GET /challenges?category={id}&platform={platform}&difficulty={level}
  ↓
ChallengeController.list()
  ↓
ChallengeService.getChallenges()
  ├─→ 필터링 (카테고리, 플랫폼, 난이도)
  ├─→ 정렬 (최신순, 인기순)
  ├─→ 페이지네이션
  └─→ 관련 데이터 로드
  ↓
JSON 응답
  ↓
프론트엔드 목록 렌더링
```

### 4.3 기능 #3: 트렌드 분석

```
일일 배치 작업 (자정 00:00)
  ↓
배치 계산
  ├─→ 어제 수집한 모든 챌린지 조회
  ├─→ 상위 10개 선정 (view_count 기준)
  ├─→ 카테고리별 통계 계산
  ├─→ 인기 태그 추출
  └─→ trends_daily 테이블 저장
  ↓
프론트엔드 요청
  ↓
GET /trends
  ↓
TrendController.getTrends()
  ↓
TrendService.getTrends()
  ├─→ 오늘의 트렌드 조회
  ├─→ 전일/전주 대비 변화율 계산
  └─→ 응답 포맷팅
  ↓
JSON 응답 (차트 데이터 포함)
```

### 4.4 기능 #4: 데이터 수집 (배치)

```
Schedule: 매일 새벽 2시, 오후 2시, 저녁 8시 (선택)
  ↓
CollectionJob.execute()
  ↓
YouTubeAPI.searchShorts()
  ├─→ API 호출 (인기 챌린지 검색)
  ├─→ 응답 파싱
  ├─→ 중복 제거
  └─→ 데이터 정제
  ↓
카테고리 자동 분류
  ├─→ 해시태그 분석
  ├─→ 제목 키워드 매칭
  └─→ 난이도 판단
  ↓
데이터베이스 저장
  ├─→ INSERT (신규)
  ├─→ UPDATE (기존)
  └─→ collection_logs 기록
  ↓
수집 완료
```

### 4.5 기능 #5: 추천 시스템

```
사용자 앱 실행 또는 추천 탭 접속
  ↓
GET /recommendations?limit={limit}&days={days}
  ↓
RecommendationController.recommend()
  ↓
RecommendationService.getRecommendations()
  ├─→ 최근 X일 트렌드 데이터 조회
  ├─→ 상위 카테고리 선정 (점수 기준)
  ├─→ 카테고리별 최신 챌린지 추출
  ├─→ 랜덤 섞기 (사용자 경험 개선)
  └─→ 응답 포맷팅
  ↓
JSON 응답
  ↓
프론트엔드 카드 형태 렌더링
```

---

## 5. 백엔드 개발 태스크 체크리스트

### Phase 1: 기초 인프라 (1주차)

- [ ] Node.js + Express 프로젝트 초기화
- [ ] .env 파일 및 설정 구조 구축
- [ ] MySQL 데이터베이스 생성 및 테이블 생성
- [ ] 공통 응답 포맷 미들웨어 작성
- [ ] 에러 처리 미들웨어 작성
- [ ] 기본 로깅 시스템 구축

**완료 기준:**
```bash
npm start → 서버 정상 실행
MySQL 연결 성공
기본 라우터 응답 확인
```

---

### Phase 2: API 구현 기초 (1주차 후반 ~ 2주차 초반)

- [ ] 기능 #1: 검색 API (3개 엔드포인트)
  - [ ] SearchController 작성
  - [ ] SearchService 작성
  - [ ] 데이터베이스 쿼리 최적화
  - [ ] 요청 유효성 검증

- [ ] 기능 #2: 조회 API (3개 엔드포인트)
  - [ ] ChallengeController 작성
  - [ ] ChallengeService 작성
  - [ ] 필터링 로직
  - [ ] 페이지네이션 구현

**완료 기준:**
- Postman/curl로 모든 엔드포인트 테스트 성공
- 응답 시간 < 500ms

---

### Phase 3: 트렌드 및 추천 (2주차 후반)

- [ ] 기능 #3: 트렌드 API (3개 엔드포인트)
  - [ ] TrendController 작성
  - [ ] TrendService 작성
  - [ ] 트렌드 계산 알고리즘

- [ ] 기능 #5: 추천 API (1개 엔드포인트)
  - [ ] RecommendationController 작성
  - [ ] RecommendationService 작성

**완료 기준:**
- 트렌드 데이터 조회 성공
- 추천 데이터 정상 반환

---

### Phase 4: 데이터 수집 및 최적화 (3주차)

- [ ] 기능 #4: 데이터 수집 (CollectionJob)
  - [ ] YouTube API 연동
  - [ ] TikTok API 연동 (선택)
  - [ ] 카테고리 자동 분류 로직
  - [ ] 중복 제거 로직
  - [ ] 배치 작업 스케줄러 (선택)

- [ ] 데이터베이스 최적화
  - [ ] 인덱스 검증
  - [ ] 쿼리 성능 확인

**완료 기준:**
- YouTube API에서 데이터 정상 수집
- 자동 분류 정확도 80% 이상

---

### Phase 5: 최종 검증 (4주차)

- [ ] 전체 API 통합 테스트
- [ ] 데이터 일관성 검증
- [ ] 에러 케이스 처리 확인
- [ ] API 응답 시간 측정
- [ ] 문서 작성 (API 명세서)

**완료 기준:**
- 모든 11개 엔드포인트 정상 작동
- 에러 응답 형식 통일
- API 명세서 완성

---

## 6. 기능별 상세 설계

(이 섹션은 다음 문서 "기능별 명세서"에서 상세히 다룸)

### 6.1 기능 #1: 챌린지 검색

**엔드포인트 개수:** 3개
- `GET /search` - 기본 검색
- `GET /search/advanced` - 고급 검색 (필터 포함)
- `GET /search/trending` - 트렌딩 검색어

**주요 기능:**
- 제목, 설명, 채널명, 해시태그에서 검색
- 정렬: 최신순, 인기순, 관련도순
- 필터: 카테고리, 플랫폼, 난이도, 기간
- 페이지네이션

---

### 6.2 기능 #2: 챌린지 조회

**엔드포인트 개수:** 3개
- `GET /challenges` - 목록 조회
- `GET /challenges/{id}` - 상세 조회
- `GET /challenges/category/{categoryId}` - 카테고리별 조회

**주요 기능:**
- 목록 조회: 정렬, 필터, 페이지네이션
- 상세 조회: 전체 정보 + 관련 챌린지
- 카테고리별: 해당 카테고리의 모든 챌린지

---

### 6.3 기능 #3: 트렌드 분석

**엔드포인트 개수:** 3개
- `GET /trends` - 전체 트렌드 대시보드
- `GET /trends/daily` - 일별 상세 트렌드
- `GET /trends/category/{categoryId}` - 카테고리별 트렌드

**주요 기능:**
- 실시간 인기 순위
- 카테고리별 통계
- 플랫폼별 비교
- 시간대별 변화 추이

---

### 6.4 기능 #4: 데이터 수집

**엔드포인트 개수:** 1개
- `GET /collection-logs` - 수집 로그 조회

**주요 기능:**
- YouTube API 자동 수집 (배치)
- TikTok API 수집 (선택, 배치)
- 자동 분류 및 태그 생성
- 중복 제거

---

### 6.5 기능 #5: 추천 시스템

**엔드포인트 개수:** 1개
- `GET /recommendations` - 트렌드 기반 추천

**주요 기능:**
- 최근 트렌드 데이터 기반
- 카테고리별 상위 챌린지 추천
- 다양성 보장 (여러 카테고리)

---

## 7. 데이터 모델 및 관계도

### 7.1 Entity Relationship Diagram (ERD)

```
categories (1) ──── (N) challenges
                        │
                        │
                        ├──── (N) challenge_tags (N) ──── tags (1)
                        │
                        └──── (N) trends_daily

collection_logs (독립적)
```

### 7.2 JSON 응답 데이터 모델

#### 챌린지 객체 (Challenge)

```json
{
  "challenge_id": 1,
  "platform": "youtube",
  "video_id": "dQw4w9WgXcQ",
  "title": "새로운 춤 챌린지 배우기",
  "description": "이 영상에서 최신 춤 챌린지를 배워보세요...",
  "thumbnail_url": "https://i.ytimg.com/...",
  "channel_name": "댄스튜토리얼",
  "channel_url": "https://youtube.com/...",
  "video_url": "https://youtube.com/watch?v=...",
  "view_count": 150000,
  "like_count": 8500,
  "comment_count": 1200,
  "share_count": 450,
  "upload_date": "2025-11-20T10:30:00Z",
  "duration_seconds": 180,
  "difficulty": "medium",
  "category": {
    "category_id": 1,
    "category_name": "댄스",
    "category_code": "dance"
  },
  "tags": [
    {
      "tag_id": 5,
      "tag_name": "#신나는춤",
      "confidence": 0.95
    },
    {
      "tag_id": 6,
      "tag_name": "#초급",
      "confidence": 0.88
    }
  ],
  "collected_at": "2025-11-27T02:15:00Z",
  "is_verified": true
}
```

#### 트렌드 객체 (Trend)

```json
{
  "trend_id": 42,
  "trend_date": "2025-11-27",
  "category": {
    "category_id": 1,
    "category_name": "댄스"
  },
  "top_10_challenges": [
    {
      "rank": 1,
      "challenge_id": 1,
      "title": "새로운 춤 챌린지",
      "view_count": 150000,
      "score": 95
    },
    {
      "rank": 2,
      "challenge_id": 5,
      "title": "핫플레이스 댄스 챌린지",
      "view_count": 125000,
      "score": 88
    }
  ],
  "top_tags": [
    { "tag": "#신나는춤", "count": 45 },
    { "tag": "#초급", "count": 38 }
  ],
  "avg_view_count": 85000,
  "total_challenges_count": 245,
  "total_views": 20825000,
  "trend_score": 92,
  "compared_to_previous_day": 12.5,
  "compared_to_previous_week": 28.3
}
```

---

## 8. 프로젝트 폴더 구조

### 8.1 표준 Express.js 구조

```
ChallengeHub-backend/
├── src/
│   ├── api/
│   │   ├── youtube.js          # YouTube API 클라이언트
│   │   └── tiktok.js           # TikTok API 클라이언트
│   │
│   ├── config/
│   │   ├── database.js         # MySQL 연결 설정
│   │   ├── env.js              # 환경변수 로드
│   │   └── constants.js        # 상수 정의
│   │
│   ├── controllers/
│   │   ├── searchController.js
│   │   ├── challengeController.js
│   │   ├── trendController.js
│   │   ├── collectionController.js
│   │   └── recommendationController.js
│   │
│   ├── services/
│   │   ├── searchService.js
│   │   ├── challengeService.js
│   │   ├── trendService.js
│   │   ├── collectionService.js
│   │   └── recommendationService.js
│   │
│   ├── models/
│   │   ├── Challenge.js        # 챌린지 모델
│   │   ├── Category.js         # 카테고리 모델
│   │   ├── Tag.js              # 태그 모델
│   │   ├── Trend.js            # 트렌드 모델
│   │   └── CollectionLog.js    # 수집 로그 모델
│   │
│   ├── middleware/
│   │   ├── errorHandler.js     # 에러 처리
│   │   ├── responseFormatter.js # 응답 포맷팅
│   │   ├── validator.js        # 요청 유효성 검증
│   │   └── logger.js           # 로깅
│   │
│   ├── routes/
│   │   ├── searchRoutes.js
│   │   ├── challengeRoutes.js
│   │   ├── trendRoutes.js
│   │   ├── collectionRoutes.js
│   │   ├── recommendationRoutes.js
│   │   └── index.js            # 라우터 통합
│   │
│   ├── utils/
│   │   ├── dateUtils.js        # 날짜 관련 유틸
│   │   ├── stringUtils.js      # 문자열 관련 유틸
│   │   ├── queryBuilder.js     # 쿼리 빌더
│   │   └── validators.js       # 데이터 검증
│   │
│   ├── batch/
│   │   ├── collectionJob.js    # 수집 배치 작업
│   │   ├── trendCalculator.js  # 트렌드 계산
│   │   └── scheduler.js        # 스케줄러 (선택)
│   │
│   └── app.js                  # Express 앱 설정
│
├── sql/
│   ├── schema.sql              # 전체 테이블 스키마
│   ├── initial_data.sql        # 초기 데이터
│   └── migrations/             # 마이그레이션 파일 (향후)
│
├── tests/                      # 테스트 파일 (선택)
│
├── .env.example                # 환경변수 템플릿
├── .gitignore
├── package.json
├── package-lock.json
├── server.js                   # 진입점
├── README.md
└── DEVELOPMENT_GUIDE.md        # 개발 가이드
```

### 8.2 폴더별 책임

| 폴더 | 책임 |
|------|------|
| **api/** | 외부 API 호출 로직 (YouTube, TikTok) |
| **config/** | 설정 및 환경 변수 |
| **controllers/** | 요청 처리 및 응답 반환 |
| **services/** | 비즈니스 로직 구현 |
| **models/** | 데이터베이스 모델 및 쿼리 |
| **middleware/** | 요청/응답 처리 미들웨어 |
| **routes/** | API 라우팅 |
| **utils/** | 유틸리티 함수 |
| **batch/** | 배치 작업 및 스케줄러 |
| **sql/** | 데이터베이스 스크립트 |

---

## 9. 주차별 개발 스케줄

### 📅 1주차: 기초 인프라 및 기본 API

#### 일정
- **월요일 ~ 수요일**: 환경 설정 및 DB 구축
- **목요일 ~ 금요일**: 기능 #1, #2 API 기초 구현

#### 태스크

**월요일 (Day 1-2)**
- [ ] Node.js 프로젝트 초기화
  - `npm init` 또는 generator 사용
  - 필수 라이브러리 설치: express, mysql2, dotenv, axios
  - 폴더 구조 생성
  
- [ ] MySQL 데이터베이스 생성
  - 데이터베이스 생성: `challengehub`
  - 테이블 생성 (위의 SQL 스크립트 실행)
  - 초기 데이터 입력 (카테고리 8개)

- [ ] .env 파일 설정
  ```
  NODE_ENV=development
  PORT=3000
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=...
  DB_NAME=challengehub
  YOUTUBE_API_KEY=...
  ```

**수요일 (Day 3)**
- [ ] 공통 미들웨어 작성
  - responseFormatter: 표준 응답 포맷
  - errorHandler: 에러 처리
  - validator: 요청 유효성 검증

- [ ] 기본 라우터 구조
  - `src/routes/index.js` 작성
  - 모든 라우터 통합
  - 헬스 체크 엔드포인트 추가

**목요일 (Day 4)**
- [ ] 기능 #1: 검색 API
  - SearchController 작성
  - SearchService 작성 (기본 검색 로직)
  - `GET /search` 엔드포인트 구현

**금요일 (Day 5)**
- [ ] 기능 #2: 조회 API
  - ChallengeController 작성
  - ChallengeService 작성
  - `GET /challenges` 엔드포인트 구현

#### 완료 기준
```bash
✅ 서버 정상 실행 (npm start)
✅ MySQL 연결 성공
✅ GET /search 테스트 성공
✅ GET /challenges 테스트 성공
✅ 응답 포맷 표준화
```

---

### 📅 2주차: 검색 고도화 및 트렌드 API

#### 일정
- **월요일 ~ 수요일**: 기능 #1 완성 (고급 검색)
- **목요일 ~ 금요일**: 기능 #3 트렌드 API

#### 태스크

**월요일 (Day 6)**
- [ ] 기능 #1 완성: 고급 검색
  - `GET /search/advanced` 엔드포인트
  - 필터링 로직 (카테고리, 플랫폼, 난이도, 기간)
  - 정렬 로직 (최신순, 인기순, 관련도순)

**수요일 (Day 7)**
- [ ] 기능 #1 추가: 트렌딩 검색어
  - `GET /search/trending` 엔드포인트
  - 인기 검색어 추출 로직
  - 캐싱 (선택)

- [ ] 기능 #2 완성
  - `GET /challenges/{id}` 상세 조회
  - `GET /challenges/category/{categoryId}` 카테고리별 조회
  - 관련 챌린지 추천 로직

**목요일 (Day 8)**
- [ ] 기능 #3: 트렌드 API
  - TrendController 작성
  - TrendService 작성
  - `GET /trends` 엔드포인트

**금요일 (Day 9)**
- [ ] 기능 #3 완성
  - `GET /trends/daily` 상세 트렌드
  - `GET /trends/category/{categoryId}` 카테고리별 트렌드
  - 트렌드 계산 알고리즘 검증

#### 완료 기준
```bash
✅ 모든 검색 API 정상 작동
✅ 필터링 & 정렬 로직 검증
✅ 트렌드 데이터 조회 성공
✅ 응답 시간 < 500ms
```

---

### 📅 3주차: 데이터 수집 및 추천 API

#### 일정
- **월요일 ~ 수요일**: 기능 #4 데이터 수집
- **목요일 ~ 금요일**: 기능 #5 추천 API + 최적화

#### 태스크

**월요일 (Day 10)**
- [ ] 기능 #4: YouTube API 연동
  - YouTube API 클라이언트 작성 (`src/api/youtube.js`)
  - 쇼츠 검색 함수 구현
  - 응답 파싱 및 데이터 정제

- [ ] 자동 분류 로직
  - 해시태그 분석
  - 제목 키워드 매칭
  - 난이도 판단

**수요일 (Day 11)**
- [ ] 데이터베이스 저장 로직
  - 중복 제거 (unique key 체크)
  - INSERT/UPDATE 로직
  - collection_logs 기록

- [ ] CollectionService 작성
  - 전체 수집 프로세스 조율
  - 에러 처리 및 로깅

**목요일 (Day 12)**
- [ ] 기능 #5: 추천 API
  - RecommendationController 작성
  - RecommendationService 작성
  - `GET /recommendations` 엔드포인트

- [ ] 기능 #4 추가
  - `GET /collection-logs` 엔드포인트
  - 수집 로그 조회 로직

**금요일 (Day 13)**
- [ ] 성능 최적화
  - 데이터베이스 인덱스 검증
  - 쿼리 성능 측정
  - 느린 쿼리 최적화

- [ ] TikTok API 연동 (선택)
  - `src/api/tiktok.js` 작성
  - 필요시만 구현

#### 완료 기준
```bash
✅ YouTube API 데이터 정상 수집
✅ 자동 분류 정확도 80% 이상
✅ 추천 데이터 정상 반환
✅ 모든 11개 엔드포인트 작동
```

---

### 📅 4주차: 통합 테스트 및 최종 검증

#### 일정
- **월요일 ~ 수요일**: 통합 테스트 및 버그 수정
- **목요일 ~ 금요일**: 최종 검증 및 문서화

#### 태스크

**월요일 (Day 14)**
- [ ] 전체 API 통합 테스트
  - Postman/curl로 모든 엔드포인트 테스트
  - 에러 케이스 처리 확인
  - 응답 형식 통일성 검증

**수요일 (Day 15)**
- [ ] 데이터 일관성 검증
  - 데이터베이스 상태 확인
  - 중복 데이터 확인
  - 트렌드 계산 정확도 검증

- [ ] 버그 수정 및 최적화
  - 성능 이슈 해결
  - 에러 메시지 개선
  - 로그 추가

**목요일 (Day 16)**
- [ ] API 명세서 작성
  - 모든 11개 엔드포인트 문서화
  - 요청/응답 예시 추가
  - 에러 코드 정의

**금요일 (Day 17)**
- [ ] 최종 검증
  - 전체 기능 재검증
  - 데이터 품질 확인
  - 배포 준비

#### 완료 기준
```bash
✅ 모든 엔드포인트 정상 작동
✅ 에러 응답 형식 통일
✅ API 명세서 100% 완성
✅ 프로덕션 배포 가능
```

---

## 10. 기능 간 연동 설계

### 10.1 데이터 흐름 통합

```
┌─────────────────────────────────────────────┐
│ YouTube API / TikTok API (외부)             │
└─────────────────┬───────────────────────────┘
                  │ (기능 #4: 수집)
                  ↓
         ┌────────────────┐
         │ challenges DB  │ (챌린지 저장)
         └────┬───────┬──┬┘
              │       │  │
              │       │  └──→ challenge_tags (태그 연결)
              │       │       └──→ tags (태그 마스터)
              │       │
              │       └──→ categories (카테고리)
              │
              ├──→ 기능 #1 (검색)
              │    - 제목, 설명, 채널명 전문 검색
              │
              ├──→ 기능 #2 (조회)
              │    - 목록, 상세, 카테고리별 조회
              │
              ├──→ 기능 #3 (트렌드)
              │    - trends_daily 계산 기반
              │    - view_count, like_count 집계
              │
              ├──→ 기능 #5 (추천)
              │    - 트렌드 데이터 기반
              │    - 인기 챌린지 추천
              │
              └──→ collection_logs (로그 기록)
                   - 수집 통계 저장
```

### 10.2 API 호출 시나리오

#### 사용자 시나리오 1: "댄스 챌린지 검색"

```
1. 프론트엔드: GET /search?q=댄스&category=dance
   ↓
2. SearchController.search() → 유효성 검증
   ↓
3. SearchService.searchChallenges()
   - challenges 테이블에서 LIKE 검색
   - categories 조인
   - challenge_tags/tags 조인
   - 결과 정렬 & 페이지네이션
   ↓
4. 응답 포맷팅 (responseFormatter)
   ↓
5. JSON 응답 (Challenge 객체 배열)
```

#### 사용자 시나리오 2: "오늘의 트렌드 확인"

```
1. 프론트엔드: GET /trends
   ↓
2. TrendController.getTrends() → 인증 (없음) → 유효성 검증
   ↓
3. TrendService.getTrends()
   - trends_daily에서 오늘 데이터 조회
   - 전일/전주 대비 변화율 계산
   - top_10_challenges JSON 파싱
   - 응답 포맷팅
   ↓
4. 백그라운드 (배치): 
   - 매일 자정에 trends_daily 갱신
   - 어제 수집한 challenges 집계
   - 카테고리별 통계 계산
   ↓
5. JSON 응답 (Trend 객체)
```

### 10.3 의존성 관리

```
독립적 (순서 상관없음):
├─ 기능 #1 (검색): challenges, categories, tags 필요
├─ 기능 #2 (조회): challenges, categories, tags 필요
├─ 기능 #3 (트렌드): trends_daily 필요
├─ 기능 #4 (수집): 외부 API 필요
└─ 기능 #5 (추천): trends_daily, challenges 필요

순환 의존성 없음 ✅
각 기능이 독립적으로 작동 가능 ✅
```

---

## 📌 성공 기준 및 검증

### 최종 성공 기준

| 항목 | 기준 | 검증 방법 |
|------|------|---------|
| **기능 완성도** | 11개 API 엔드포인트 모두 구현 | 각 엔드포인트 테스트 |
| **응답 시간** | P95 < 500ms | Apache Bench / curl |
| **데이터 정확도** | 자동 분류 80% 이상 | 샘플 데이터 수동 검증 |
| **에러 처리** | 모든 에러 케이스 대응 | 잘못된 입력값 테스트 |
| **데이터 일관성** | 중복 없음, 정규화 완료 | DB 쿼리 검증 |
| **문서화** | API 명세서 100% 완성 | 모든 엔드포인트 문서화 |

### 검증 체크리스트

```
☐ 모든 API 엔드포인트 정상 작동
☐ 요청/응답 형식 표준화
☐ 에러 응답 형식 통일
☐ 데이터베이스 쿼리 최적화
☐ YouTube API 데이터 수집 성공
☐ 자동 분류 로직 검증
☐ 트렌드 계산 정확도 확인
☐ 추천 알고리즘 검증
☐ API 명세서 완성
☐ 프로덕션 배포 가능
```

---

## 📚 추가 고려사항

### 확장 가능성

현재 설계는 다음과 같이 확장 가능:
- **Redis 캐싱**: 응답 시간 최적화
- **사용자 인증**: JWT 추가
- **사용자 데이터**: 북마크, 평가 등 저장
- **배치 스케줄러**: 정기적 데이터 수집 자동화
- **더 많은 플랫폼**: Instagram Reels, 등 추가

### 향후 개선 사항

1. **성능**: Redis 캐싱 추가
2. **안정성**: 배치 작업 재시도 로직
3. **모니터링**: 로그 분석, 메트릭 수집
4. **보안**: Rate Limiting, CORS 설정

---

## 🎯 개발 시작 전 체크리스트

- [ ] Node.js 18+ 설치 확인
- [ ] MySQL 8.0+ 설치 및 실행
- [ ] YouTube API 키 발급
- [ ] GitHub 리포지토리 생성
- [ ] .env 파일 템플릿 준비
- [ ] 팀 커뮤니케이션 채널 설정

---

**문서 버전**: 1.0  
**최종 수정**: 2025-11-27  
**다음 단계**: 기능별 상세 명세서 검토 및 개발 시작
