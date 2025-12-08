import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl
} from 'react-native';
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
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortType, setSortType] = useState('popular');  // 기본값을 인기순으로 변경

  useEffect(() => {
    loadChallenges();
  }, [sortType]);

  const loadChallenges = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
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
  }, [sortType]);

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

  if (isLoading && challenges.length === 0) {
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
        <Text style={styles.logo}>Smore ✨</Text>
        <TouchableOpacity onPress={toggleSort}>
          <View style={styles.sortButton}>
            <Ionicons name="swap-vertical" size={20} color={colors.primary} />
            <Text style={[styles.sortText, { marginLeft: spacing.xs }]}>
              {sortType === 'popular' ? '인기순' : '최신순'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 챌린지 그리드 */}
      <FlatList
        data={challenges}
        numColumns={2}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    paddingTop: 50
  },
  logo: {
    ...typography.h1,
    color: colors.primary
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sortText: {
    ...typography.body_md,
    color: colors.primary,
    fontWeight: '600'
  },
  content: {
    padding: spacing.sm
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
  }
});
