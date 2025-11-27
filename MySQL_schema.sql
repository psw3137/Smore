-- ========================================
-- ChallengHub MySQL Database Schema
-- ========================================
-- 작성일: 2025-11-27
-- 설명: 챌린지 데이터를 저장하는 MySQL 스키마

-- ========================================
-- 1. 데이터베이스 생성
-- ========================================
CREATE DATABASE IF NOT EXISTS challengehub
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE challengehub;

-- ========================================
-- 2. 카테고리 테이블
-- ========================================
CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '카테고리 ID',
  category_name VARCHAR(100) NOT NULL UNIQUE COMMENT '카테고리 이름',
  category_code VARCHAR(50) NOT NULL UNIQUE COMMENT '카테고리 코드',
  description VARCHAR(500) COMMENT '카테고리 설명',
  icon_url VARCHAR(500) COMMENT '아이콘 URL',
  weight INT DEFAULT 1 COMMENT '트렌드 가중치',
  display_order INT DEFAULT 0 COMMENT '표시 순서',
  is_active BOOLEAN DEFAULT TRUE COMMENT '활성 여부',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  
  INDEX idx_active (is_active),
  INDEX idx_order (display_order)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='챌린지 카테고리';

-- ========================================
-- 3. 해시태그 테이블
-- ========================================
CREATE TABLE tags (
  tag_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '태그 ID',
  tag_name VARCHAR(100) NOT NULL UNIQUE COMMENT '태그 이름 (원본)',
  tag_normalized VARCHAR(100) NOT NULL UNIQUE COMMENT '정규화된 태그명',
  usage_count INT DEFAULT 0 COMMENT '사용 빈도',
  category_id INT COMMENT '주 카테고리 ID',
  is_trending BOOLEAN DEFAULT FALSE COMMENT '트렌딩 여부',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  INDEX idx_normalized (tag_normalized),
  INDEX idx_trending (is_trending),
  INDEX idx_usage (usage_count)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='해시태그 마스터';

-- ========================================
-- 4. 챌린지 데이터 테이블
-- ========================================
CREATE TABLE challenges (
  challenge_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '챌린지 ID',
  platform ENUM('youtube', 'tiktok') NOT NULL COMMENT '플랫폼',
  video_id VARCHAR(255) NOT NULL UNIQUE COMMENT '플랫폼 비디오 ID',
  title VARCHAR(500) NOT NULL COMMENT '제목',
  description LONGTEXT COMMENT '설명',
  thumbnail_url VARCHAR(500) COMMENT '썸네일 URL',
  channel_name VARCHAR(255) COMMENT '채널명',
  channel_url VARCHAR(500) COMMENT '채널 URL',
  video_url VARCHAR(500) COMMENT '비디오 URL',
  view_count BIGINT DEFAULT 0 COMMENT '조회수',
  like_count BIGINT DEFAULT 0 COMMENT '좋아요 수',
  comment_count BIGINT DEFAULT 0 COMMENT '댓글 수',
  share_count INT DEFAULT 0 COMMENT '공유 수',
  upload_date DATETIME COMMENT '업로드 날짜',
  duration_seconds INT COMMENT '영상 길이(초)',
  
  primary_category_id INT COMMENT '주 카테고리 ID',
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium' COMMENT '난이도',
  
  is_active BOOLEAN DEFAULT TRUE COMMENT '활성 여부',
  is_verified BOOLEAN DEFAULT FALSE COMMENT '검증 여부',
  collection_source VARCHAR(100) COMMENT '수집 경로',
  
  collected_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '수집 날짜',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  
  FOREIGN KEY (primary_category_id) REFERENCES categories(category_id),
  INDEX idx_platform (platform),
  INDEX idx_category (primary_category_id),
  INDEX idx_collected (collected_at),
  INDEX idx_views (view_count),
  INDEX idx_trending (upload_date, view_count),
  UNIQUE KEY uk_platform_video (platform, video_id)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='챌린지 데이터';

-- ========================================
-- 5. 챌린지-태그 연결 테이블
-- ========================================
CREATE TABLE challenge_tags (
  challenge_tag_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '연결 ID',
  challenge_id INT NOT NULL COMMENT '챌린지 ID',
  tag_id INT NOT NULL COMMENT '태그 ID',
  confidence DECIMAL(3, 2) COMMENT '신뢰도 (0.0~1.0)',
  added_by ENUM('auto', 'manual') DEFAULT 'auto' COMMENT '추가 방식',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  
  FOREIGN KEY (challenge_id) REFERENCES challenges(challenge_id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE,
  UNIQUE KEY uk_challenge_tag (challenge_id, tag_id),
  INDEX idx_challenge (challenge_id),
  INDEX idx_tag (tag_id)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='챌린지-태그 연결';

-- ========================================
-- 6. 일별 트렌드 테이블
-- ========================================
CREATE TABLE trends_daily (
  trend_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '트렌드 ID',
  trend_date DATE NOT NULL COMMENT '트렌드 날짜',
  category_id INT COMMENT '카테고리 ID',
  
  top_10_challenges JSON COMMENT 'Top 10 챌린지 데이터',
  top_tags JSON COMMENT 'Top 태그 데이터',
  avg_view_count DECIMAL(15, 2) COMMENT '평균 조회수',
  total_challenges_count INT COMMENT '총 챌린지 수',
  total_views BIGINT COMMENT '총 조회수',
  trend_score INT COMMENT '트렌드 점수 (0-100)',
  
  compared_to_previous_day DECIMAL(5, 2) COMMENT '전일 대비 변화율(%)',
  compared_to_previous_week DECIMAL(5, 2) COMMENT '전주 대비 변화율(%)',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  
  UNIQUE KEY uk_date_category (trend_date, category_id),
  INDEX idx_date (trend_date),
  INDEX idx_category (category_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='일별 트렌드 데이터';

-- ========================================
-- 7. 수집 로그 테이블
-- ========================================
CREATE TABLE collection_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '로그 ID',
  platform ENUM('youtube', 'tiktok') NOT NULL COMMENT '플랫폼',
  collection_type ENUM('full', 'incremental') COMMENT '수집 타입',
  collection_date DATETIME NOT NULL COMMENT '수집 날짜',
  
  total_collected INT DEFAULT 0 COMMENT '수집한 총 개수',
  total_new INT DEFAULT 0 COMMENT '신규 추가 개수',
  total_updated INT DEFAULT 0 COMMENT '업데이트된 개수',
  total_duplicate INT DEFAULT 0 COMMENT '중복 개수',
  
  status ENUM('success', 'partial', 'failed') DEFAULT 'success' COMMENT '상태',
  error_message LONGTEXT COMMENT '에러 메시지',
  execution_time_seconds INT COMMENT '실행 시간(초)',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  
  INDEX idx_platform (platform),
  INDEX idx_date (collection_date),
  INDEX idx_status (status)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='API 수집 로그';

-- ========================================
-- 8. 초기 데이터 삽입
-- ========================================

-- 카테고리 데이터
INSERT INTO categories (category_name, category_code, description, weight, display_order) VALUES
('댄스', 'dance', '춤 관련 챌린지', 10, 1),
('립싱크', 'lipsync', '입술싱크 챌린지', 8, 2),
('운동', 'exercise', '피트니스 챌린지', 9, 3),
('요리', 'cooking', '요리 관련 챌린지', 7, 4),
('코미디', 'comedy', '재미있는 챌린지', 8, 5),
('뷰티', 'beauty', '뷰티/메이크업 챌린지', 7, 6),
('게임', 'gaming', '게임 관련 챌린지', 6, 7),
('기타', 'other', '기타 카테고리', 5, 8);

-- ========================================
-- 9. 인덱스 최적화
-- ========================================

-- challenges 테이블 추가 인덱스
ALTER TABLE challenges
ADD INDEX idx_platform_active (platform, is_active),
ADD INDEX idx_category_active (primary_category_id, is_active),
ADD INDEX idx_difficulty (difficulty),
ADD INDEX idx_upload_date (upload_date);

-- ========================================
-- 10. 뷰(View) 생성 (선택사항)
-- ========================================

-- 활성 챌린지만 조회
CREATE OR REPLACE VIEW v_active_challenges AS
SELECT * FROM challenges WHERE is_active = TRUE;

-- 검증된 챌린지만 조회
CREATE OR REPLACE VIEW v_verified_challenges AS
SELECT * FROM challenges WHERE is_active = TRUE AND is_verified = TRUE;

-- 카테고리별 통계
CREATE OR REPLACE VIEW v_category_stats AS
SELECT 
  cat.category_id,
  cat.category_name,
  cat.category_code,
  COUNT(c.challenge_id) as total_challenges,
  AVG(c.view_count) as avg_view_count,
  SUM(c.view_count) as total_views,
  AVG(c.like_count) as avg_like_count
FROM categories cat
LEFT JOIN challenges c ON cat.category_id = c.primary_category_id AND c.is_active = TRUE
GROUP BY cat.category_id, cat.category_name, cat.category_code;

-- 플랫폼별 통계
CREATE OR REPLACE VIEW v_platform_stats AS
SELECT 
  c.platform,
  COUNT(c.challenge_id) as total_challenges,
  AVG(c.view_count) as avg_view_count,
  SUM(c.view_count) as total_views,
  MAX(c.upload_date) as latest_upload
FROM challenges c
WHERE c.is_active = TRUE
GROUP BY c.platform;

-- ========================================
-- 11. 저장 프로시저 (선택사항)
-- ========================================

-- 트렌드 계산 프로시저
DELIMITER //

CREATE PROCEDURE sp_calculate_daily_trends()
BEGIN
  DECLARE v_trend_date DATE DEFAULT CURDATE();
  
  -- 전체 트렌드 데이터 삽입
  INSERT INTO trends_daily (
    trend_date,
    category_id,
    top_10_challenges,
    avg_view_count,
    total_challenges_count,
    total_views,
    trend_score
  )
  SELECT
    v_trend_date,
    cat.category_id,
    JSON_ARRAY_INSERT(
      JSON_ARRAY(),
      '$[0]',
      JSON_OBJECT(
        'challenge_id', c.challenge_id,
        'title', c.title,
        'view_count', c.view_count
      )
    ),
    AVG(c.view_count),
    COUNT(c.challenge_id),
    SUM(c.view_count),
    ROUND(AVG(c.view_count) / 10000)
  FROM categories cat
  LEFT JOIN challenges c ON cat.category_id = c.primary_category_id
    AND c.is_active = TRUE
    AND DATE(c.upload_date) = v_trend_date - INTERVAL 1 DAY
  GROUP BY cat.category_id
  ON DUPLICATE KEY UPDATE
    total_challenges_count = VALUES(total_challenges_count),
    avg_view_count = VALUES(avg_view_count),
    trend_score = VALUES(trend_score);
END //

DELIMITER ;

-- ========================================
-- 12. 테이블 문자 인코딩 확인
-- ========================================

-- 모든 테이블의 문자 인코딩 확인
SELECT 
  TABLE_NAME,
  TABLE_COLLATION
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'challengehub';

-- ========================================
-- 13. 성능 최적화 설정
-- ========================================

-- InnoDB 버퍼 풀 설정 (my.cnf에서 수행)
-- innodb_buffer_pool_size = 256M

-- 쿼리 캐시 활성화 (MySQL 5.7 이하)
-- query_cache_size = 32M
-- query_cache_type = ON

-- ========================================
-- 완료!
-- ========================================
-- 생성된 테이블:
-- - categories (카테고리)
-- - tags (해시태그)
-- - challenges (챌린지 데이터)
-- - challenge_tags (챌린지-태그 연결)
-- - trends_daily (일별 트렌드)
-- - collection_logs (수집 로그)
--
-- 생성된 뷰:
-- - v_active_challenges
-- - v_verified_challenges
-- - v_category_stats
-- - v_platform_stats
--
-- 생성된 프로시저:
-- - sp_calculate_daily_trends()
-- ========================================
