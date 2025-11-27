# ChallengHub Express.js 백엔드 개발 가이드

**작성일:** 2025-11-27  
**대상:** Claude Code (AI Agent), 백엔드 개발팀  
**버전:** 1.0  

---

## 📋 목차

1. [프로젝트 초기화](#1-프로젝트-초기화)
2. [폴더 구조 상세](#2-폴더-구조-상세)
3. [핵심 개발 패턴](#3-핵심-개발-패턴)
4. [파일별 구현 템플릿](#4-파일별-구현-템플릿)
5. [API 응답 포맷팅](#5-api-응답-포맷팅)
6. [에러 처리](#6-에러-처리)
7. [데이터베이스 쿼리](#7-데이터베이스-쿼리)
8. [실전 예제](#8-실전-예제)

---

## 1. 프로젝트 초기화

### 1.1 Node.js 환경 설정

```bash
# 프로젝트 폴더 생성
mkdir challengehub-backend
cd challengehub-backend

# npm 초기화
npm init -y

# 필수 라이브러리 설치
npm install express mysql2 dotenv axios cors body-parser

# 개발 의존성
npm install --save-dev nodemon
```

### 1.2 package.json 구성

```json
{
  "name": "challengehub-backend",
  "version": "1.0.0",
  "description": "ChallengHub API Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "mysql2": "^3.0.0",
    "dotenv": "^16.0.0",
    "axios": "^1.3.0",
    "cors": "^2.8.5",
    "body-parser": "^1.20.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

### 1.3 .env 파일 생성

```env
# 서버 설정
NODE_ENV=development
PORT=3000

# MySQL 데이터베이스
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=challengehub

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# TikTok API (선택)
TIKTOK_API_KEY=your_tiktok_api_key

# CORS 설정
CORS_ORIGIN=*

# 로깅 레벨
LOG_LEVEL=debug
```

---

## 2. 폴더 구조 상세

### 2.1 전체 구조

```
challengehub-backend/
├── src/
│   ├── api/
│   │   ├── youtube.js          # YouTube API 클라이언트
│   │   └── tiktok.js           # TikTok API 클라이언트
│   │
│   ├── config/
│   │   ├── database.js         # MySQL 연결 풀
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
│   │   ├── Challenge.js
│   │   ├── Category.js
│   │   ├── Tag.js
│   │   ├── Trend.js
│   │   └── CollectionLog.js
│   │
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── responseFormatter.js
│   │   ├── validator.js
│   │   └── logger.js
│   │
│   ├── routes/
│   │   ├── searchRoutes.js
│   │   ├── challengeRoutes.js
│   │   ├── trendRoutes.js
│   │   ├── collectionRoutes.js
│   │   ├── recommendationRoutes.js
│   │   └── index.js
│   │
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── stringUtils.js
│   │   ├── queryBuilder.js
│   │   └── validators.js
│   │
│   ├── batch/
│   │   ├── collectionJob.js
│   │   └── scheduler.js
│   │
│   └── app.js
│
├── sql/
│   └── schema.sql
│
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

---

## 3. 핵심 개발 패턴

### 3.1 계층 구조 패턴

```
Route (API 엔드포인트)
  ↓
Controller (요청/응답 처리)
  ↓
Service (비즈니스 로직)
  ↓
Model (데이터베이스 쿼리)
  ↓
Database (MySQL)
```

### 3.2 요청 처리 흐름

```javascript
// 1. Route: 요청을 컨트롤러로 전달
router.get('/search', searchController.search);

// 2. Controller: 요청 검증 및 서비스 호출
async search(req, res) {
  const { q, sort } = req.query;
  
  // 입력 검증
  if (!q || q.length < 2) {
    return res.status(400).json(errorResponse(...));
  }
  
  // 서비스 호출
  const results = await searchService.search(q, sort);
  
  // 응답
  return res.status(200).json(successResponse(results));
}

// 3. Service: 비즈니스 로직 처리
async search(query, sortType) {
  // 쿼리 정규화
  const normalizedQuery = normalizeQuery(query);
  
  // 모델을 통해 데이터 조회
  const results = await challengeModel.search(normalizedQuery, sortType);
  
  // 결과 처리
  return results.map(r => formatChallenge(r));
}

// 4. Model: 데이터베이스 쿼리
async search(query, sortType) {
  const sql = buildSearchSQL(query, sortType);
  const [rows] = await db.query(sql, [query]);
  return rows;
}
```

---

## 4. 파일별 구현 템플릿

### 4.1 server.js (진입점)

```javascript
// server.js
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
```

### 4.2 app.js (Express 앱 설정)

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { responseFormatter } = require('./middleware/responseFormatter');

const app = express();

// 미들웨어
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 응답 포맷팅 미들웨어
app.use(responseFormatter);

// 라우터
app.use('/api/v1', routes);

// 헬스 체크
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: 'API endpoint not found'
  });
});

// 에러 처리 미들웨어 (마지막)
app.use(errorHandler);

module.exports = app;
```

### 4.3 config/database.js (MySQL 연결)

```javascript
// src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 연결 테스트
pool.getConnection()
  .then(conn => {
    console.log('✅ MySQL connected');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err);
    process.exit(1);
  });

module.exports = pool;
```

### 4.4 middleware/responseFormatter.js

```javascript
// src/middleware/responseFormatter.js
function responseFormatter(req, res, next) {
  // 응답 메서드 확장
  res.successResponse = function(data, message = 'Success', code = 'SUCCESS') {
    return this.json({
      success: true,
      code: code,
      message: message,
      data: data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    });
  };

  res.errorResponse = function(statusCode, code, message, errors = []) {
    return this.status(statusCode).json({
      success: false,
      code: code,
      message: message,
      errors: errors,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    });
  };

  next();
}

module.exports = { responseFormatter };
```

### 4.5 middleware/errorHandler.js

```javascript
// src/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // MySQL 에러
  if (err.code && err.code.startsWith('ER_')) {
    return res.errorResponse(
      500,
      'DB_ERROR',
      'Database error occurred',
      [{ message: err.message }]
    );
  }

  // 유효성 검증 에러
  if (err.statusCode === 400) {
    return res.errorResponse(
      400,
      'VALIDATION_ERROR',
      err.message,
      err.errors || []
    );
  }

  // 기타 에러
  return res.errorResponse(
    500,
    'INTERNAL_ERROR',
    'Internal server error',
    [{ message: err.message }]
  );
}

module.exports = { errorHandler };
```

### 4.6 Controller 템플릿

```javascript
// src/controllers/searchController.js
const searchService = require('../services/searchService');

class SearchController {
  async search(req, res, next) {
    try {
      const { q, sort = 'relevance', page = 1, limit = 20 } = req.query;

      // 입력 검증
      if (!q || q.length < 2) {
        return res.errorResponse(400, 'INVALID_QUERY', 'Query must be at least 2 characters');
      }

      if (limit > 100) {
        return res.errorResponse(400, 'INVALID_LIMIT', 'Limit must be <= 100');
      }

      // 서비스 호출
      const results = await searchService.search(q, sort, page, limit);

      // 응답
      return res.successResponse(results, 'Search completed');
    } catch (error) {
      next(error);
    }
  }

  async searchAdvanced(req, res, next) {
    try {
      const {
        q,
        category,
        platform,
        difficulty,
        date_from,
        date_to,
        min_views = 0,
        sort = 'relevance',
        page = 1,
        limit = 20
      } = req.query;

      // 복잡한 검증 로직...

      const results = await searchService.searchAdvanced({
        q,
        category,
        platform,
        difficulty,
        date_from,
        date_to,
        min_views,
        sort,
        page,
        limit
      });

      return res.successResponse(results, 'Advanced search completed');
    } catch (error) {
      next(error);
    }
  }

  async getTrendingKeywords(req, res, next) {
    try {
      const { limit = 10, days = 7 } = req.query;

      const keywords = await searchService.getTrendingKeywords(limit, days);

      return res.successResponse(keywords, 'Trending keywords retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController();
```

### 4.7 Service 템플릿

```javascript
// src/services/searchService.js
const challengeModel = require('../models/Challenge');

class SearchService {
  async search(query, sortType, page, limit) {
    // 쿼리 정규화
    const normalizedQuery = this.normalizeQuery(query);

    // 페이지네이션 계산
    const offset = (page - 1) * limit;

    // 데이터 조회
    const results = await challengeModel.search(normalizedQuery, sortType, limit, offset);
    const totalCount = await challengeModel.countByQuery(normalizedQuery);

    // 응답 포맷
    return {
      query: query,
      total_results: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(totalCount / limit),
      has_next: page < Math.ceil(totalCount / limit),
      has_previous: page > 1,
      results: results.map(r => this.formatChallenge(r))
    };
  }

  normalizeQuery(query) {
    return query
      .trim()
      .toLowerCase()
      .replace(/[#@]/g, '');
  }

  formatChallenge(challenge) {
    return {
      challenge_id: challenge.challenge_id,
      platform: challenge.platform,
      title: challenge.title,
      // ... 더 많은 필드
    };
  }
}

module.exports = new SearchService();
```

### 4.8 Model 템플릿

```javascript
// src/models/Challenge.js
const pool = require('../config/database');

class Challenge {
  async search(query, sortType, limit, offset) {
    const sql = `
      SELECT *
      FROM challenges c
      LEFT JOIN categories cat ON c.primary_category_id = cat.category_id
      WHERE c.is_active = TRUE
        AND (
          c.title LIKE CONCAT('%', ?, '%')
          OR c.description LIKE CONCAT('%', ?, '%')
          OR c.channel_name LIKE CONCAT('%', ?, '%')
        )
      ORDER BY ${this.getSortClause(sortType)}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(sql, [query, query, query, limit, offset]);
    return rows;
  }

  async countByQuery(query) {
    const sql = `
      SELECT COUNT(*) as count
      FROM challenges c
      WHERE c.is_active = TRUE
        AND (
          c.title LIKE CONCAT('%', ?, '%')
          OR c.description LIKE CONCAT('%', ?, '%')
          OR c.channel_name LIKE CONCAT('%', ?, '%')
        )
    `;

    const [[{ count }]] = await pool.query(sql, [query, query, query]);
    return count;
  }

  getSortClause(sortType) {
    const sortMap = {
      'relevance': 'c.view_count DESC, c.upload_date DESC',
      'latest': 'c.upload_date DESC',
      'popular': 'c.view_count DESC'
    };

    return sortMap[sortType] || sortMap['relevance'];
  }
}

module.exports = new Challenge();
```

### 4.9 routes/index.js

```javascript
// src/routes/index.js
const express = require('express');
const searchRoutes = require('./searchRoutes');
const challengeRoutes = require('./challengeRoutes');
const trendRoutes = require('./trendRoutes');
const collectionRoutes = require('./collectionRoutes');
const recommendationRoutes = require('./recommendationRoutes');

const router = express.Router();

// API 라우터 마운트
router.use('/search', searchRoutes);
router.use('/challenges', challengeRoutes);
router.use('/trends', trendRoutes);
router.use('/collection-logs', collectionRoutes);
router.use('/recommendations', recommendationRoutes);

module.exports = router;
```

### 4.10 routes/searchRoutes.js

```javascript
// src/routes/searchRoutes.js
const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

// GET /api/v1/search?q=...
router.get('/', searchController.search);

// GET /api/v1/search/advanced?q=...&category=...
router.get('/advanced', searchController.searchAdvanced);

// GET /api/v1/search/trending
router.get('/trending', searchController.getTrendingKeywords);

module.exports = router;
```

---

## 5. API 응답 포맷팅

### 5.1 성공 응답

```javascript
// 사용 예시
res.successResponse(data, 'Challenges retrieved', 'SUCCESS');

// 출력
{
  "success": true,
  "code": "SUCCESS",
  "message": "Challenges retrieved",
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-27T15:30:00Z",
    "version": "1.0"
  }
}
```

### 5.2 에러 응답

```javascript
// 사용 예시
res.errorResponse(400, 'INVALID_QUERY', 'Query must be at least 2 characters', [
  { field: 'q', message: 'Too short' }
]);

// 출력
{
  "success": false,
  "code": "INVALID_QUERY",
  "message": "Query must be at least 2 characters",
  "errors": [
    { "field": "q", "message": "Too short" }
  ],
  "meta": {
    "timestamp": "2025-11-27T15:30:00Z",
    "version": "1.0"
  }
}
```

---

## 6. 에러 처리

### 6.1 에러 코드 정의

| 코드 | HTTP | 설명 |
|------|------|------|
| `INVALID_QUERY` | 400 | 잘못된 검색어 |
| `INVALID_LIMIT` | 400 | 잘못된 limit 값 |
| `INVALID_PAGE` | 400 | 잘못된 page 값 |
| `INVALID_CATEGORY` | 400 | 유효하지 않은 카테고리 |
| `NOT_FOUND` | 404 | 리소스를 찾을 수 없음 |
| `DB_ERROR` | 500 | 데이터베이스 오류 |
| `INTERNAL_ERROR` | 500 | 내부 서버 오류 |

### 6.2 에러 처리 패턴

```javascript
try {
  // 작업 수행
  const results = await service.getData();
  return res.successResponse(results);
} catch (error) {
  if (error.code === 'ER_BAD_FIELD_ERROR') {
    return res.errorResponse(500, 'DB_ERROR', 'Database field error');
  }
  // 다른 에러 처리...
  next(error);
}
```

---

## 7. 데이터베이스 쿼리

### 7.1 쿼리 작성 규칙

```javascript
// ❌ 나쁜 예: SQL Injection 취약
const sql = `SELECT * FROM challenges WHERE title = '${query}'`;

// ✅ 좋은 예: 파라미터화 쿼리
const sql = `SELECT * FROM challenges WHERE title = ?`;
const [rows] = await pool.query(sql, [query]);
```

### 7.2 쿼리 최적화 팁

```javascript
// 1. 필요한 컬럼만 선택
SELECT id, title, view_count FROM challenges; // ✅
SELECT * FROM challenges; // ❌

// 2. 인덱스 활용
WHERE platform = 'youtube' AND category_id = 1; // ✅ (복합 인덱스)

// 3. LIMIT 사용
SELECT * FROM challenges LIMIT 20 OFFSET 40; // ✅

// 4. JOIN 최소화
LEFT JOIN categories ON challenges.category_id = categories.id; // ✅
```

---

## 8. 실전 예제

### 8.1 완전한 검색 API 구현

```javascript
// 1. Route
router.get('/', searchController.search);

// 2. Controller
async search(req, res, next) {
  try {
    const { q, sort, page, limit } = req.query;
    
    // 입력 검증
    if (!q || q.length < 2) {
      return res.errorResponse(400, 'INVALID_QUERY', 'Query too short');
    }
    
    const results = await searchService.search(q, sort, page, limit);
    return res.successResponse(results);
  } catch (error) {
    next(error);
  }
}

// 3. Service
async search(query, sortType, page, limit) {
  const normalized = this.normalizeQuery(query);
  const offset = (page - 1) * limit;
  
  const results = await challengeModel.search(normalized, sortType, limit, offset);
  const total = await challengeModel.countByQuery(normalized);
  
  return {
    query: query,
    total_results: total,
    page: parseInt(page),
    limit: parseInt(limit),
    results: results.map(r => this.format(r))
  };
}

// 4. Model
async search(query, sort, limit, offset) {
  const sql = `
    SELECT * FROM challenges
    WHERE is_active = TRUE
      AND (title LIKE ? OR description LIKE ? OR channel_name LIKE ?)
    ORDER BY ${this.getSortClause(sort)}
    LIMIT ? OFFSET ?
  `;
  
  const [rows] = await pool.query(sql, [
    `%${query}%`,
    `%${query}%`,
    `%${query}%`,
    limit,
    offset
  ]);
  
  return rows;
}
```

### 8.2 카테고리별 챌린지 조회

```javascript
// Controller
async getChallengesByCategory(req, res, next) {
  try {
    const { categoryId } = req.params;
    const { sort = 'latest', page = 1, limit = 20 } = req.query;
    
    const results = await challengeService.getChallengesByCategory(
      categoryId,
      sort,
      page,
      limit
    );
    
    return res.successResponse(results);
  } catch (error) {
    next(error);
  }
}

// Service
async getChallengesByCategory(categoryId, sort, page, limit) {
  const offset = (page - 1) * limit;
  
  const results = await challengeModel.getByCategoryId(categoryId, sort, limit, offset);
  const total = await challengeModel.countByCategory(categoryId);
  
  return {
    category_id: categoryId,
    total_results: total,
    page: parseInt(page),
    results
  };
}

// Model
async getByCategoryId(categoryId, sort, limit, offset) {
  const sql = `
    SELECT c.*,
           cat.category_id,
           cat.category_name,
           cat.category_code
    FROM challenges c
    LEFT JOIN categories cat ON c.primary_category_id = cat.category_id
    WHERE c.is_active = TRUE AND c.primary_category_id = ?
    ORDER BY ${this.getSortClause(sort)}
    LIMIT ? OFFSET ?
  `;
  
  const [rows] = await pool.query(sql, [categoryId, limit, offset]);
  return rows;
}
```

### 8.3 트렌드 계산

```javascript
// Service
async calculateDailyTrends() {
  // 어제 수집된 모든 챌린지 조회
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const challenges = await challengeModel.getChallengesByDate(yesterday);
  
  // 카테고리별로 그룹화
  const byCategory = {};
  challenges.forEach(c => {
    if (!byCategory[c.category_id]) {
      byCategory[c.category_id] = [];
    }
    byCategory[c.category_id].push(c);
  });
  
  // 각 카테고리별 트렌드 계산
  for (const [categoryId, chs] of Object.entries(byCategory)) {
    const score = this.calculateTrendScore(chs);
    const top10 = chs
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 10);
    
    // DB에 저장
    await trendModel.saveDailyTrend({
      trend_date: new Date().toISOString().split('T')[0],
      category_id: categoryId,
      top_10_challenges: JSON.stringify(top10),
      trend_score: score
    });
  }
}

// 트렌드 점수 계산
calculateTrendScore(challenges) {
  const avgViews = challenges.reduce((sum, c) => sum + c.view_count, 0) / challenges.length;
  const avgLikes = challenges.reduce((sum, c) => sum + c.like_count, 0) / challenges.length;
  
  return Math.round((avgViews / 100000 * 50 + avgLikes / 5000 * 50) / 100);
}
```

---

## 📝 체크리스트

개발 시 확인할 사항:

- [ ] 모든 엔드포인트에 입력 검증 추가
- [ ] 모든 에러를 try-catch로 처리
- [ ] 응답 포맷 표준화
- [ ] MySQL 연결 풀 설정
- [ ] 인덱스 최적화
- [ ] API 응답 시간 < 500ms
- [ ] CORS 설정
- [ ] 환경 변수 설정
- [ ] .gitignore에 .env 추가
- [ ] README.md 작성

---

## 📚 참고 자료

- [Express.js 공식 문서](https://expressjs.com/)
- [MySQL 연결 풀](https://github.com/sidorares/node-mysql2)
- [Node.js 모범 사례](https://nodejs.org/en/docs/guides/nodejs-performance-best-practices/)

---

**문서 버전**: 1.0  
**작성일**: 2025-11-27  
**상태**: 완성
