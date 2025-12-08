import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const CategoryRankingRow = ({ rank, name, count, percentage, color }) => {
  return (
    <View style={styles.row}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rank, rank <= 3 && styles.topRank]}>#{rank}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progress,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: color || colors.primary
              }
            ]}
          />
        </View>
        <Text style={styles.count}>{count}개</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider
  },
  rankContainer: {
    width: 40,
    alignItems: 'center'
  },
  rank: {
    ...typography.body_md,
    color: colors.text_secondary,
    fontWeight: '600'
  },
  topRank: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16
  },
  name: {
    ...typography.body_md,
    color: colors.text_primary,
    flex: 1,
    fontWeight: '600'
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: spacing.sm
  },
  progress: {
    height: '100%',
    borderRadius: 4
  },
  count: {
    ...typography.body_sm,
    color: colors.text_secondary,
    width: 50,
    textAlign: 'right'
  }
});
