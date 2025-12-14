import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ChallengeCard } from '../components/ChallengeCard';
import { challengeAPI } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 3) / 2;

export default function HomeScreen({ navigation }) {
  const [challenges, setChallenges] = useState([]);
  const [dailyPicks, setDailyPicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortType, setSortType] = useState('popular');  // 기본값을 인기순으로 변경

  // 함수들을 먼저 정의
  const loadDailyPicks = useCallback(async () => {
    try {
      const data = await challengeAPI.getDailyPicks();
      setDailyPicks(data.picks || []);
    } catch (error) {
      console.error('Failed to load daily picks:', error);
      // Daily Picks 로드 실패는 치명적이지 않으므로 조용히 실패
      setDailyPicks([]);
    }
  }, []); // 의존성 없음 - API 호출만 수행

  const loadChallenges = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
      // 리프레시할 때 Daily Picks도 함께 새로고침
      loadDailyPicks();
    } else {
      setIsLoading(true);
    }
    try {
      const data = await challengeAPI.getChallenges({
        sort: sortType,
        page: 1,
        limit: 20
      });
      setChallenges(data.challenges || []);
      setPage(2);
      setHasMore(data.has_next || false);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [sortType, loadDailyPicks]); // loadDailyPicks를 의존성에 추가

  // useEffect: 컴포넌트 마운트 시 및 sortType 변경 시 데이터 로드
  useEffect(() => {
    loadChallenges();
    loadDailyPicks();
  }, [loadChallenges, loadDailyPicks]);

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    try {
      const data = await challengeAPI.getChallenges({
        sort: sortType,
        page,
        limit: 20
      });
      setChallenges(prev => [...prev, ...(data.challenges || [])]);
      setPage(prev => prev + 1);
      setHasMore(data.has_next || false);
    } catch (error) {
      console.error('Failed to load more:', error);
    }
  };

  const handleChallengePress = (challenge) => {
    navigation.navigate('ChallengeDetail', {
      challengeId: challenge.challenge_id,
      categoryId: challenge.category_id,
      sortType: sortType // 현재 정렬 타입 전달
    });
  };

  const toggleSort = () => {
    setSortType(prev => prev === 'popular' ? 'latest' : 'popular');
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="film-outline" size={80} color={colors.text_tertiary} />
        <Text style={styles.emptyText}>챌린지가 없습니다</Text>
      </View>
    );
  };

  const renderDailyPicks = () => {
    if (dailyPicks.length === 0) return null;

    return (
      <View style={styles.dailyPicksSection}>
        <View style={styles.dailyPicksHeader}>
          <Text style={styles.dailyPicksTitle}>🔥 오늘의 추천</Text>
          <Text style={styles.dailyPicksSubtitle}>매일 새롭게 업데이트</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dailyPicksScroll}
        >
          {dailyPicks.map((pick, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dailyPickCard}
              onPress={() => handleChallengePress({
                ...pick.challenge,
                category_id: pick.category_id
              })}
            >
              {pick.challenge.thumbnail_url ? (
                <Image
                  source={{ uri: pick.challenge.thumbnail_url }}
                  style={styles.dailyPickImage}
                />
              ) : (
                <View style={styles.dailyPickImagePlaceholder} />
              )}
              <View style={styles.dailyPickOverlay}>
                <Text style={styles.dailyPickCategory}>{pick.category_name}</Text>
                <Text style={styles.dailyPickReason}>{pick.pick_reason}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (isLoading && challenges.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 with 그라디언트 */}
      <LinearGradient
        colors={colors.gradient.warm}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>Smore</Text>
            <Text style={styles.logoEmoji}>✨</Text>
          </View>
          <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
            <View style={styles.sortButtonInner}>
              <Ionicons name="swap-vertical" size={18} color={colors.text_white} />
              <Text style={styles.sortText}>
                {sortType === 'popular' ? '인기순' : '최신순'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* 챌린지 그리드 */}
      <FlatList
        data={challenges}
        numColumns={2}
        ListHeaderComponent={renderDailyPicks}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <ChallengeCard
              challenge={item}
              onPress={() => handleChallengePress(item)}
            />
          </View>
        )}
        keyExtractor={(item, index) => `${item.challenge_id}-${index}`}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadChallenges(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text_white,
    letterSpacing: -0.5,
  },
  logoEmoji: {
    fontSize: 24,
    marginLeft: spacing.xs,
  },
  sortButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sortButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortText: {
    ...typography.body_sm,
    color: colors.text_white,
    fontWeight: '600',
  },
  content: {
    padding: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'flex-start'
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  loader: {
    paddingVertical: spacing.lg,
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2
  },
  emptyText: {
    ...typography.body_lg,
    color: colors.text_tertiary,
    marginTop: spacing.md
  },
  dailyPicksSection: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  dailyPicksHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm
  },
  dailyPicksTitle: {
    ...typography.h2,
    color: colors.text_primary,
    fontWeight: '800',
    fontSize: 20,
  },
  dailyPicksSubtitle: {
    ...typography.body_sm,
    color: colors.text_secondary,
    marginTop: 4,
    fontWeight: '500',
  },
  dailyPicksScroll: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm
  },
  dailyPickCard: {
    width: 160,
    height: 220,
    marginRight: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dailyPickImage: {
    width: '100%',
    height: '100%'
  },
  dailyPickImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface
  },
  dailyPickOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
  },
  dailyPickCategory: {
    ...typography.body_sm,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 11,
  },
  dailyPickReason: {
    ...typography.body_sm,
    color: colors.text_white,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
  }
});
