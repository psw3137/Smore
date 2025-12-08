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
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ChallengeCard } from '../components/ChallengeCard';
import { storageService } from '../services/storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 3) / 2;

export default function ProfileScreen({ navigation }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 화면이 포커스될 때마다 북마크 새로고침
  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [])
  );

  const loadBookmarks = async () => {
    try {
      const data = await storageService.getBookmarks();
      // 최신순으로 정렬
      const sorted = data.sort((a, b) =>
        new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt)
      );
      setBookmarks(sorted);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBookmarks();
  }, []);

  const handleChallengePress = (challenge) => {
    navigation.navigate('ChallengeDetail', {
      challengeId: challenge.challenge_id,
      categoryId: challenge.category_id,
      sortType: 'latest' // 북마크는 최신순
    });
  };

  const handleRemoveBookmark = async (challenge) => {
    await storageService.removeBookmark(challenge.challenge_id);
    loadBookmarks(); // 목록 새로고침
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="bookmark-outline" size={80} color={colors.text_tertiary} />
      <Text style={styles.emptyText}>저장된 챌린지가 없습니다</Text>
      <Text style={styles.emptySubText}>
        마음에 드는 챌린지를 북마크해보세요
      </Text>
    </View>
  );

  if (isLoading) {
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
        <Text style={styles.headerTitle}>내 프로필</Text>
      </View>

      {/* 북마크 카운트 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="bookmark" size={24} color={colors.primary} />
          <Text style={styles.statLabel}>저장한 챌린지</Text>
          <Text style={styles.statValue}>{bookmarks.length}개</Text>
        </View>
      </View>

      {/* 북마크 목록 */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>북마크</Text>
        {bookmarks.length > 0 && (
          <TouchableOpacity onPress={loadBookmarks}>
            <Ionicons name="refresh" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={bookmarks}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH, position: 'relative' }}>
            <ChallengeCard
              challenge={item}
              onPress={() => handleChallengePress(item)}
            />
            {/* 북마크 제거 버튼 */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveBookmark(item)}
            >
              <Ionicons name="bookmark" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => `bookmark-${item.challenge_id}-${index}`}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={bookmarks.length > 0 ? styles.content : styles.emptyContent}
        columnWrapperStyle={bookmarks.length > 0 ? styles.columnWrapper : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
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
  statsContainer: {
    padding: spacing.lg
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statLabel: {
    ...typography.body_md,
    color: colors.text_secondary,
    marginTop: spacing.sm
  },
  statValue: {
    ...typography.h2,
    color: colors.text_primary,
    fontWeight: '700',
    marginTop: spacing.xs
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  listTitle: {
    ...typography.h3,
    color: colors.text_primary,
    fontWeight: '700'
  },
  content: {
    padding: spacing.sm
  },
  emptyContent: {
    flex: 1
  },
  columnWrapper: {
    justifyContent: 'flex-start'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2
  },
  emptyText: {
    ...typography.h3,
    color: colors.text_tertiary,
    marginTop: spacing.md
  },
  emptySubText: {
    ...typography.body_md,
    color: colors.text_tertiary,
    marginTop: spacing.sm,
    textAlign: 'center'
  },
  removeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface_light,
    borderRadius: 20,
    padding: spacing.xs,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});
