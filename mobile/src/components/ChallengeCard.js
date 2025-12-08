import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const ChallengeCard = ({ challenge, onPress }) => {
  const getDifficultyColor = (difficulty) => {
    return colors.difficulty[difficulty] || colors.difficulty.medium;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* 썸네일 */}
      {challenge.thumbnail_url ? (
        <Image
          source={{ uri: challenge.thumbnail_url }}
          style={styles.thumbnail}
        />
      ) : (
        <View style={styles.thumbnailPlaceholder} />
      )}

      {/* 플랫폼 배지 */}
      <View
        style={[
          styles.platformBadge,
          {
            backgroundColor:
              challenge.platform === 'youtube'
                ? colors.platform.youtube
                : colors.platform.tiktok
          }
        ]}
      >
        <Text style={styles.platformText}>
          {challenge.platform === 'youtube' ? 'YOUTUBE' : 'TIKTOK'}
        </Text>
      </View>

      {/* 콘텐츠 */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {challenge.title}
        </Text>

        <View style={styles.metaRow}>
          <Text
            style={[
              styles.difficulty,
              { color: getDifficultyColor(challenge.difficulty) }
            ]}
          >
            {challenge.difficulty ? challenge.difficulty.toUpperCase() : 'MEDIUM'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <Text style={styles.stat}>👁 {formatNumber(challenge.view_count)}</Text>
          <Text style={styles.stat}>❤️ {formatNumber(challenge.like_count)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface_light,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surface
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surface
  },
  platformBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4
  },
  platformText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600'
  },
  content: {
    padding: spacing.md
  },
  title: {
    ...typography.body_md,
    color: '#000000',
    marginBottom: spacing.sm,
    fontWeight: '600'
  },
  metaRow: {
    marginBottom: spacing.sm
  },
  difficulty: {
    fontSize: 10,
    fontWeight: '600'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stat: {
    fontSize: 10,
    color: colors.text_secondary
  }
});
