import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator
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

const categories = [
  { id: 1, code: 'dance', name: '댄스', icon: '🎵', color: colors.category.dance },
  { id: 2, code: 'lipsync', name: '립싱크', icon: '🎤', color: colors.category.lipsync },
  { id: 3, code: 'exercise', name: '운동', icon: '🏃', color: colors.category.exercise },
  { id: 4, code: 'cooking', name: '요리', icon: '👨‍🍳', color: colors.category.cooking },
  { id: 5, code: 'comedy', name: '코미디', icon: '😂', color: colors.category.comedy },
  { id: 6, code: 'beauty', name: '뷰티', icon: '💄', color: colors.category.beauty },
  { id: 7, code: 'gaming', name: '게임', icon: '🎮', color: colors.category.gaming },
  { id: 8, code: 'other', name: '기타', icon: '⭐', color: colors.category.other }
];

export default function CategoryScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleCategoryPress = async (category) => {
    setSelectedCategory(category);
    setIsLoading(true);
    try {
      const data = await challengeAPI.getChallengesByCategory(category.id, {
        sort: 'latest',
        page: 1,
        limit: 20
      });
      setChallenges(data.challenges || []);
      setPage(2);
      setHasMore(data.has_next || false);
    } catch (error) {
      console.error('Failed to load category challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading || !selectedCategory) return;

    try {
      const data = await challengeAPI.getChallengesByCategory(selectedCategory.id, {
        sort: 'latest',
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

  const handleBackPress = () => {
    setSelectedCategory(null);
    setChallenges([]);
    setPage(1);
    setHasMore(true);
  };

  const handleChallengePress = (challenge) => {
    navigation.navigate('ChallengeDetail', {
      challengeId: challenge.challenge_id,
      categoryId: challenge.category_id || selectedCategory?.id,
      sortType: 'latest'
    });
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  };

  // 카테고리 선택 화면
  if (!selectedCategory) {
    return (
      <View style={styles.container}>
        {/* 헤더 */}
        <LinearGradient
          colors={colors.gradient.warm}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <Text style={styles.headerTitle}>카테고리</Text>
        </LinearGradient>

        {/* 카테고리 그리드 */}
        <View style={styles.categoryContainer}>
          <FlatList
            data={categories}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => handleCategoryPress(item)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIconBg, { backgroundColor: item.color + '20' }]}>
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                </View>
                <Text style={[styles.categoryName, { color: item.color }]}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            columnWrapperStyle={styles.categoryRow}
            contentContainerStyle={styles.categoryContent}
          />
        </View>
      </View>
    );
  }

  // 카테고리별 챌린지 화면
  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <LinearGradient
        colors={colors.gradient.warm}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text_white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedCategory.name}</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {/* 챌린지 그리드 */}
      {isLoading && challenges.length === 0 ? (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
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
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>{selectedCategory.icon}</Text>
              <Text style={styles.emptyText}>
                {selectedCategory.name} 챌린지가 없습니다
              </Text>
            </View>
          )}
          contentContainerStyle={styles.content}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
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
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text_white,
    letterSpacing: -0.5,
  },
  backButton: {
    padding: spacing.xs
  },
  categoryContainer: {
    flex: 1,
    padding: spacing.md
  },
  categoryContent: {
    paddingVertical: spacing.lg
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  categoryButton: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: spacing.sm,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  categoryIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    fontSize: 40,
  },
  categoryName: {
    ...typography.h3,
    fontWeight: '800',
    fontSize: 16,
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
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.md
  },
  emptyText: {
    ...typography.body_lg,
    color: colors.text_tertiary,
    marginTop: spacing.md
  }
});
