import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ChallengeCard } from '../components/ChallengeCard';
import { challengeAPI } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 3) / 2;

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [trendingKeywords, setTrendingKeywords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortType, setSortType] = useState('relevance');

  useEffect(() => {
    loadTrendingKeywords();
  }, []);

  const loadTrendingKeywords = async () => {
    try {
      const data = await challengeAPI.getTrendingKeywords({ limit: 10, days: 7 });
      setTrendingKeywords(data.trending_keywords || []);
    } catch (error) {
      console.error('Failed to load trending keywords:', error);
    }
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query || query.length < 2) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await challengeAPI.searchChallenges(query, {
        sort: sortType,
        page: 1,
        limit: 20
      });
      setSearchResults(data.results || []);
      setPage(2);
      setHasMore(data.has_next || false);
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading || !searchQuery) return;

    try {
      const data = await challengeAPI.searchChallenges(searchQuery, {
        sort: sortType,
        page,
        limit: 20
      });
      setSearchResults(prev => [...prev, ...(data.results || [])]);
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
      sortType: sortType
    });
  };

  const handleTrendingKeywordPress = (keyword) => {
    setSearchQuery(keyword);
    handleSearch(keyword);
  };

  const toggleSort = () => {
    const newSort = sortType === 'relevance' ? 'latest' : sortType === 'latest' ? 'popular' : 'relevance';
    setSortType(newSort);
    if (hasSearched && searchQuery) {
      handleSearch(searchQuery);
    }
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
    if (!hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={80} color={colors.text_tertiary} />
          <Text style={styles.emptyText}>검색어를 입력하세요</Text>
        </View>
      );
    }

    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={80} color={colors.text_tertiary} />
        <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
      </View>
    );
  };

  const getSortText = () => {
    switch (sortType) {
      case 'relevance': return '관련성';
      case 'latest': return '최신순';
      case 'popular': return '인기순';
      default: return '관련성';
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>검색</Text>
      </View>

      {/* 검색 바 */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.text_secondary} />
        <TextInput
          placeholder="챌린지 검색..."
          placeholderTextColor={colors.text_secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch()}
          style={styles.input}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.text_secondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={toggleSort} style={styles.sortIcon}>
          <Ionicons name="funnel" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* 정렬 표시 */}
      {hasSearched && (
        <View style={styles.sortInfo}>
          <Text style={styles.sortInfoText}>정렬: {getSortText()}</Text>
        </View>
      )}

      {/* 트렌딩 키워드 */}
      {!hasSearched && (
        <View style={styles.trendingSection}>
          <Text style={styles.sectionTitle}>📈 트렌딩 검색어</Text>
          <View style={styles.trendingGrid}>
            {trendingKeywords.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.trendingBadge}
                onPress={() => handleTrendingKeywordPress(item.keyword)}
              >
                <Text style={styles.trendingText}>
                  #{item.keyword} ({item.search_count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 검색 결과 또는 빈 상태 */}
      {hasSearched ? (
        <FlatList
          data={searchResults}
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
          contentContainerStyle={styles.content}
          columnWrapperStyle={styles.columnWrapper}
        />
      ) : (
        renderEmpty()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12
  },
  input: {
    flex: 1,
    ...typography.body_md,
    color: colors.text_primary,
    paddingVertical: spacing.xs
  },
  sortIcon: {
    marginLeft: spacing.xs
  },
  sortInfo: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm
  },
  sortInfoText: {
    ...typography.body_sm,
    color: colors.text_secondary
  },
  trendingSection: {
    padding: spacing.lg
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text_primary,
    marginBottom: spacing.md
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  trendingBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderColor: colors.border
  },
  trendingText: {
    ...typography.body_sm,
    color: colors.text_primary
  },
  content: {
    padding: spacing.sm
  },
  columnWrapper: {
    justifyContent: 'flex-start'
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
