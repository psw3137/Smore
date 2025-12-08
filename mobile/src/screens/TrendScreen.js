import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { StatCard } from '../components/StatCard';
import { CategoryRankingRow } from '../components/CategoryRankingRow';
import { ChallengeCard } from '../components/ChallengeCard';
import { challengeAPI } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 4) / 2;

const categoryColors = {
  dance: colors.category.dance,
  lipsync: colors.category.lipsync,
  exercise: colors.category.exercise,
  cooking: colors.category.cooking,
  comedy: colors.category.comedy,
  beauty: colors.category.beauty,
  gaming: colors.category.gaming,
  other: colors.category.other
};

export default function TrendScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const [trendData, setTrendData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrendData();
  }, [selectedPeriod]);

  const loadTrendData = async () => {
    setIsLoading(true);
    try {
      const data = await challengeAPI.getTrends({ days: selectedPeriod });

      // API 응답 구조를 UI가 기대하는 형태로 변환
      const transformedData = {
        total_views: data.platform_comparison?.youtube?.total_views || 0,
        total_likes: calculateTotalLikes(data.category_statistics || []),
        total_challenges: data.platform_comparison?.youtube?.total_challenges || 0,
        view_trend: `+${data.compared_to_previous_week || 0}%`,
        like_trend: '+0%',
        challenge_trend: '+0%',
        category_ranking: data.category_statistics || [],
        trending_challenges: data.top_10_challenges || []
      };

      setTrendData(transformedData);
    } catch (error) {
      console.error('Failed to load trend data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalLikes = (categories) => {
    return categories.reduce((sum, cat) => {
      return sum + (cat.avg_like_count * cat.total_challenges || 0);
    }, 0);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleChallengePress = (challenge) => {
    navigation.navigate('ChallengeDetail', {
      challengeId: challenge.challenge_id,
      categoryId: challenge.category_id,
      sortType: 'popular' // 트렌드는 인기순
    });
  };

  const PeriodButton = ({ period, label }) => {
    const isActive = selectedPeriod === period;
    return (
      <TouchableOpacity
        style={[styles.periodButton, isActive && styles.periodButtonActive]}
        onPress={() => setSelectedPeriod(period)}
      >
        <Text style={[styles.periodText, isActive && styles.periodTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading && !trendData) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>트렌드</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 기간 선택 */}
        <View style={styles.periodSelector}>
          <PeriodButton period={7} label="7일" />
          <PeriodButton period={14} label="14일" />
          <PeriodButton period={30} label="30일" />
        </View>

        {/* 통계 카드 */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="👁"
            label="조회수"
            value={formatNumber(trendData?.total_views || 0)}
            trend={trendData?.view_trend || '+0%'}
          />
          <StatCard
            icon="❤️"
            label="좋아요"
            value={formatNumber(trendData?.total_likes || 0)}
            trend={trendData?.like_trend || '+0%'}
          />
          <StatCard
            icon="🎬"
            label="챌린지"
            value={formatNumber(trendData?.total_challenges || 0)}
            trend={trendData?.challenge_trend || '+0%'}
          />
        </View>

        {/* 인기 카테고리 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기 카테고리 TOP 5</Text>
          {trendData?.category_ranking && trendData.category_ranking.length > 0 ? (
            trendData.category_ranking.slice(0, 5).map((category, index) => (
              <CategoryRankingRow
                key={category.category_id || index}
                rank={index + 1}
                name={category.category_name}
                count={category.total_challenges}
                percentage={(category.total_challenges / (trendData.total_challenges || 1)) * 100}
                color={categoryColors[category.category_code] || colors.primary}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>카테고리 데이터가 없습니다</Text>
          )}
        </View>

        {/* 급상승 챌린지 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 급상승 챌린지</Text>
          {trendData?.trending_challenges && trendData.trending_challenges.length > 0 ? (
            <FlatList
              horizontal
              data={trendData.trending_challenges.slice(0, 10)}
              renderItem={({ item }) => (
                <View style={{ width: CARD_WIDTH }}>
                  <ChallengeCard
                    challenge={item}
                    onPress={() => handleChallengePress(item)}
                  />
                </View>
              )}
              keyExtractor={(item, index) => `trending-${item.challenge_id}-${index}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            <Text style={styles.emptyText}>급상승 챌린지가 없습니다</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    paddingTop: 50
  },
  headerTitle: {
    ...typography.h1,
    color: colors.primary
  },
  content: {
    paddingBottom: spacing.xxl
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: spacing.lg
  },
  periodButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.xs
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  periodText: {
    ...typography.body_md,
    color: colors.text_secondary,
    fontWeight: '600'
  },
  periodTextActive: {
    color: colors.text_primary
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text_primary,
    marginBottom: spacing.md,
    fontWeight: '700'
  },
  horizontalList: {
    paddingVertical: spacing.sm
  },
  emptyText: {
    ...typography.body_md,
    color: colors.text_tertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg
  }
});
