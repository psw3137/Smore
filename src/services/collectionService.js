// src/services/collectionService.js
const collectionLogModel = require('../models/CollectionLog');

class CollectionService {
  // 수집 로그 조회
  async getCollectionLogs(filters, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    // 데이터 조회
    const logs = await collectionLogModel.getLogs(filters, limit, offset);
    const totalCount = await collectionLogModel.countLogs(filters);

    // 통계 요약
    const summary = await collectionLogModel.getSummary(filters.days || 7);

    return {
      filter: {
        platform: filters.platform || null,
        status: filters.status || null,
        days: filters.days || 7
      },
      total_logs: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      logs: logs.map(log => this.formatLog(log)),
      summary: {
        total_platforms: summary.total_platforms || 0,
        total_collected_7days: summary.total_collected_7days || 0,
        total_new_7days: summary.total_new_7days || 0,
        success_rate_7days: parseFloat(summary.success_rate_7days || 0).toFixed(1)
      }
    };
  }

  // 로그 포맷팅
  formatLog(log) {
    const successRate = log.total_collected > 0
      ? ((log.total_new + log.total_updated) / log.total_collected * 100).toFixed(1)
      : 0;

    return {
      log_id: log.log_id,
      platform: log.platform,
      collection_type: log.collection_type,
      collection_date: log.collection_date,
      total_collected: log.total_collected,
      total_new: log.total_new,
      total_updated: log.total_updated,
      total_duplicate: log.total_duplicate,
      status: log.status,
      execution_time_seconds: log.execution_time_seconds,
      error_message: log.error_message,
      success_rate: parseFloat(successRate)
    };
  }
}

module.exports = new CollectionService();
