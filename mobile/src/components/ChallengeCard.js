import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatNumber } from '../utils/formatters';

const ChallengeCardComponent = ({ challenge, onPress }) => {
  const getDifficultyColor = (difficulty) => {
    return colors.difficulty[difficulty] || colors.difficulty.medium;
  };

  const getPlatformGradient = (platform) => {
    return platform === 'youtube'
      ? ['#FF0000', '#CC0000']
      : ['#00F7EF', '#00D4CC'];
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* 썸네일 */}
      <View style={styles.thumbnailContainer}>
        {challenge.thumbnail_url ? (
          <Image
            source={{ uri: challenge.thumbnail_url }}
            style={styles.thumbnail}
            resizeMode="cover"
            cache="force-cache"
          />
        ) : (
          <LinearGradient
            colors={['#E0E0E0', '#BDBDBD']}
            style={styles.thumbnailPlaceholder}
          />
        )}

        {/* 오버레이 그라디언트 */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.thumbnailOverlay}
        />
      </View>

      {/* 플랫폼 배지 */}
      <LinearGradient
        colors={getPlatformGradient(challenge.platform)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.platformBadge}
      >
        <Text style={styles.platformText}>
          {challenge.platform === 'youtube' ? 'YOUTUBE' : 'TIKTOK'}
        </Text>
      </LinearGradient>

      {/* 콘텐츠 */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {challenge.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(challenge.difficulty) + '20' }
          ]}>
            <Text
              style={[
                styles.difficulty,
                { color: getDifficultyColor(challenge.difficulty) }
              ]}
            >
              {challenge.difficulty ? challenge.difficulty.toUpperCase() : 'MEDIUM'}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.stat}>👁 {formatNumber(challenge.view_count)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.stat}>❤️ {formatNumber(challenge.like_count)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// React.memo로 성능 최적화 - props가 변경되지 않으면 리렌더링 방지
export const ChallengeCard = React.memo(ChallengeCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.challenge.challenge_id === nextProps.challenge.challenge_id &&
    prevProps.challenge.like_count === nextProps.challenge.like_count &&
    prevProps.challenge.view_count === nextProps.challenge.view_count
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.sm,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  thumbnailContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  platformBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  platformText: {
    color: colors.text_white,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.body_md,
    color: colors.text_primary,
    marginBottom: spacing.sm,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
  },
  metaRow: {
    marginBottom: spacing.sm,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficulty: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    fontSize: 11,
    color: colors.text_secondary,
    fontWeight: '500',
  }
});
