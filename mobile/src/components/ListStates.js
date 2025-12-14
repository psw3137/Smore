import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

/**
 * 로딩 푸터 컴포넌트
 */
export const LoadingFooter = () => (
  <View style={styles.loader}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

/**
 * 빈 상태 컴포넌트
 * @param {string} icon - 아이콘 이름
 * @param {string} title - 제목
 * @param {string} subtitle - 부제목 (선택)
 */
export const EmptyState = ({ icon = 'folder-open-outline', title, subtitle }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name={icon} size={80} color={colors.text_tertiary} />
    <Text style={styles.emptyText}>{title}</Text>
    {subtitle && <Text style={styles.emptySubText}>{subtitle}</Text>}
  </View>
);

/**
 * 로딩 스크린 컴포넌트
 */
export const LoadingScreen = () => (
  <View style={styles.centeredContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

/**
 * 에러 상태 컴포넌트
 * @param {string} message - 에러 메시지
 * @param {function} onRetry - 재시도 버튼 핸들러
 */
export const ErrorState = ({ message = '오류가 발생했습니다.', onRetry }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="alert-circle-outline" size={80} color={colors.error} />
    <Text style={styles.emptyText}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>다시 시도</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  loader: {
    paddingVertical: spacing.xl,
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl * 2,
  },
  emptyText: {
    marginTop: spacing.lg,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text_secondary,
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: colors.text_tertiary,
    textAlign: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  }
});
