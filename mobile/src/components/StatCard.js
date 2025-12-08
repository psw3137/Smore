import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const StatCard = ({ icon, label, value, trend }) => {
  const isPositive = trend && trend.startsWith('+');

  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {trend && (
        <Text style={[styles.trend, { color: isPositive ? colors.difficulty.easy : colors.difficulty.hard }]}>
          {trend}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    margin: spacing.xs,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.xs
  },
  label: {
    ...typography.body_sm,
    color: colors.text_secondary,
    marginBottom: spacing.xs
  },
  value: {
    ...typography.h2,
    color: colors.text_primary,
    fontWeight: '700'
  },
  trend: {
    ...typography.body_sm,
    fontWeight: '600',
    marginTop: spacing.xs
  }
});
