import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import { ChallengeCard } from './ChallengeCard';
import { LoadingFooter } from './ListStates';
import { spacing } from '../theme/spacing';
import { LAYOUT } from '../constants/app';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - LAYOUT.CARD_MARGIN * 2) / LAYOUT.GRID_COLUMNS;

/**
 * 챌린지 그리드 컴포넌트
 * @param {Array} data - 챌린지 데이터 배열
 * @param {function} onItemPress - 아이템 클릭 핸들러
 * @param {function} onEndReached - 스크롤 끝 도달 핸들러
 * @param {React.ReactNode} ListHeaderComponent - 헤더 컴포넌트
 * @param {React.ReactNode} ListEmptyComponent - 빈 상태 컴포넌트
 * @param {React.ReactNode} refreshControl - 새로고침 컨트롤
 * @param {boolean} isLoading - 로딩 상태
 * @param {Object} flatListRef - FlatList ref
 */
export const ChallengeGrid = ({
  data,
  onItemPress,
  onEndReached,
  ListHeaderComponent,
  ListEmptyComponent,
  refreshControl,
  isLoading = false,
  flatListRef,
  onEndReachedThreshold = 0.5
}) => {
  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <ChallengeCard challenge={item} onPress={() => onItemPress(item)} />
    </View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      numColumns={LAYOUT.GRID_COLUMNS}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.challenge_id}-${index}`}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={isLoading ? <LoadingFooter /> : null}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={refreshControl}
      contentContainerStyle={styles.content}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: LAYOUT.CARD_MARGIN,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  }
});
