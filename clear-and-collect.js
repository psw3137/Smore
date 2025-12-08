const db = require('./src/config/database');
const { collectYouTubeChallengesMain } = require('./src/batch/collectYouTubeChallenges');

/**
 * 데이터베이스의 모든 챌린지 데이터를 삭제하고 새로 수집합니다
 */
async function clearAndCollect() {
  console.log('🗑️  Clearing existing challenge data...\n');

  try {
    // 1. 기존 데이터 삭제 (외래 키 제약 조건 고려)
    await db.execute('DELETE FROM challenge_tags');
    console.log('✓ Deleted challenge_tags');

    await db.execute('DELETE FROM challenges');
    console.log('✓ Deleted challenges');

    await db.execute('DELETE FROM tags');
    console.log('✓ Deleted tags');

    await db.execute('DELETE FROM collection_logs');
    console.log('✓ Deleted collection_logs');

    // 2. AUTO_INCREMENT 초기화
    await db.execute('ALTER TABLE challenges AUTO_INCREMENT = 1');
    await db.execute('ALTER TABLE tags AUTO_INCREMENT = 1');
    await db.execute('ALTER TABLE collection_logs AUTO_INCREMENT = 1');
    console.log('✓ Reset AUTO_INCREMENT\n');

    console.log('✅ Database cleared successfully!\n');

    // 3. 한국 영상 새로 수집
    console.log('🇰🇷 Starting to collect Korean challenges...\n');
    console.log('📌 Region Code: KR (한국)');
    console.log('📌 Language: ko (한국어)');
    console.log('📌 Period: Last 1 month\n');

    const result = await collectYouTubeChallengesMain();

    console.log('\n✅ Collection completed!');
    console.log(`📊 Total saved: ${result.totalSaved}`);
    console.log(`⏭️  Total skipped: ${result.totalSkipped}`);

    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// 직접 실행 시
if (require.main === module) {
  clearAndCollect()
    .then(() => {
      console.log('\n🎉 All done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { clearAndCollect };
