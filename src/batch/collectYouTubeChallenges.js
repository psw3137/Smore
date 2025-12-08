const db = require('../config/database');
const { collectMultipleChallenges } = require('../api/youtubeClient');

/**
 * 카테고리별 챌린지 키워드 매핑
 * - 쇼츠 전용 검색을 위한 키워드
 */
const categoryKeywords = {
  dance: ['춤챌린지', '댄스챌린지', 'dance challenge'],
  lipsync: ['립싱크챌린지', 'lipsync challenge'],
  exercise: ['운동챌린지', '홈트챌린지', 'workout challenge'],
  cooking: ['요리챌린지', 'cooking challenge'],
  comedy: ['코미디챌린지', 'funny challenge'],
  beauty: ['메이크업챌린지', 'beauty challenge'],
  gaming: ['게임챌린지', 'gaming challenge'],
  other: ['챌린지', 'challenge']
};

/**
 * 카테고리 ID 조회
 */
async function getCategoryId(categoryCode) {
  const [rows] = await db.execute(
    'SELECT category_id FROM categories WHERE category_code = ?',
    [categoryCode]
  );
  return rows.length > 0 ? rows[0].category_id : null;
}

/**
 * 챌린지가 이미 존재하는지 확인
 */
async function challengeExists(videoId) {
  const [rows] = await db.execute(
    'SELECT challenge_id FROM challenges WHERE video_id = ?',
    [videoId]
  );
  return rows.length > 0;
}

/**
 * ISO 8601 날짜를 MySQL DATETIME으로 변환
 */
function convertToMySQLDatetime(isoString) {
  if (!isoString) return null;
  // ISO 8601 형식 (2025-01-21T14:50:47Z)을 MySQL DATETIME 형식 (2025-01-21 14:50:47)으로 변환
  return isoString.replace('T', ' ').replace('Z', '');
}

/**
 * 챌린지를 데이터베이스에 저장
 */
async function saveChallenges(challenges, categoryId) {
  let savedCount = 0;
  let skippedCount = 0;

  for (const challenge of challenges) {
    try {
      // 중복 확인
      if (await challengeExists(challenge.video_id)) {
        skippedCount++;
        continue;
      }

      // 난이도 자동 분류 (duration 기준)
      let difficulty = 'medium';
      if (challenge.duration < 20) {
        difficulty = 'easy';
      } else if (challenge.duration > 45) {
        difficulty = 'hard';
      }

      // 날짜 형식 변환
      const uploadDate = convertToMySQLDatetime(challenge.published_at);

      // 챌린지 삽입
      const [result] = await db.execute(
        `INSERT INTO challenges (
          video_id, platform, title, description, thumbnail_url, video_url,
          duration_seconds, channel_name, channel_url, primary_category_id, difficulty,
          view_count, like_count, comment_count, upload_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          challenge.video_id,
          challenge.platform,
          challenge.title,
          challenge.description,
          challenge.thumbnail_url,
          challenge.video_url,
          challenge.duration,
          challenge.channel_name,
          challenge.channel_url,
          categoryId,
          difficulty,
          challenge.view_count,
          challenge.like_count,
          challenge.comment_count,
          uploadDate
        ]
      );

      const challengeId = result.insertId;

      // 태그 저장
      if (challenge.tags && challenge.tags.length > 0) {
        for (const tagName of challenge.tags.slice(0, 10)) { // 최대 10개
          // 태그 존재 확인 및 생성
          let [tagRows] = await db.execute(
            'SELECT tag_id FROM tags WHERE tag_name = ?',
            [tagName]
          );

          let tagId;
          if (tagRows.length === 0) {
            const tagNormalized = tagName.toLowerCase().trim();
            const [tagResult] = await db.execute(
              'INSERT INTO tags (tag_name, tag_normalized) VALUES (?, ?)',
              [tagName, tagNormalized]
            );
            tagId = tagResult.insertId;
          } else {
            tagId = tagRows[0].tag_id;
          }

          // 챌린지-태그 매핑
          await db.execute(
            'INSERT IGNORE INTO challenge_tags (challenge_id, tag_id) VALUES (?, ?)',
            [challengeId, tagId]
          );
        }
      }

      savedCount++;
    } catch (error) {
      console.error(`Failed to save challenge ${challenge.video_id}:`, error.message);
      continue;
    }
  }

  return { savedCount, skippedCount };
}

/**
 * 수집 로그 저장
 */
async function saveCollectionLog(platform, status, totalCollected, totalNew, errorMessage = null) {
  await db.execute(
    `INSERT INTO collection_logs (platform, collection_date, total_collected, total_new, status, error_message)
     VALUES (?, NOW(), ?, ?, ?, ?)`,
    [platform, totalCollected, totalNew, status, errorMessage]
  );
}

/**
 * 메인 수집 함수
 */
async function collectYouTubeChallengesMain() {
  console.log('🚀 Starting YouTube challenge collection...');

  const resultsPerKeyword = 20;
  let totalSaved = 0;
  let totalSkipped = 0;

  for (const [categoryCode, keywords] of Object.entries(categoryKeywords)) {
    try {
      console.log(`\n📂 Processing category: ${categoryCode}`);

      // 카테고리 ID 조회
      const categoryId = await getCategoryId(categoryCode);
      if (!categoryId) {
        console.error(`Category not found: ${categoryCode}`);
        continue;
      }

      // 챌린지 수집
      console.log(`Collecting challenges with keywords: ${keywords.join(', ')}`);
      const challenges = await collectMultipleChallenges(keywords, resultsPerKeyword);
      console.log(`✓ Collected ${challenges.length} challenges`);

      // 데이터베이스에 저장
      const { savedCount, skippedCount } = await saveChallenges(challenges, categoryId);
      console.log(`✓ Saved: ${savedCount}, Skipped (duplicates): ${skippedCount}`);

      totalSaved += savedCount;
      totalSkipped += skippedCount;

    } catch (error) {
      console.error(`❌ Error processing category ${categoryCode}:`, error.message);
      continue;
    }
  }

  // 전체 수집 로그 저장
  try {
    await saveCollectionLog('youtube', 'success', totalSaved + totalSkipped, totalSaved);
  } catch (error) {
    console.error('Failed to save collection log:', error.message);
  }

  console.log(`\n✅ Collection completed!`);
  console.log(`📊 Total saved: ${totalSaved}`);
  console.log(`⏭ Total skipped: ${totalSkipped}`);

  return { totalSaved, totalSkipped };
}

// 직접 실행 시
if (require.main === module) {
  collectYouTubeChallengesMain()
    .then(result => {
      console.log('\n✅ Success:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = {
  collectYouTubeChallengesMain,
  saveChallenges,
  getCategoryId
};
