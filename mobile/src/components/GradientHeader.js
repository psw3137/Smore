import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

/**
 * 그라데이션 헤더 컴포넌트
 * @param {string} title - 헤더 제목
 * @param {boolean} showBackButton - 뒤로가기 버튼 표시 여부
 * @param {function} onBackPress - 뒤로가기 버튼 클릭 핸들러
 * @param {React.ReactNode} rightComponent - 우측에 표시할 컴포넌트
 * @param {Array} gradientColors - 그라데이션 색상 배열
 */
export const GradientHeader = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  gradientColors = colors.gradient.warm
}) => {
  return (
    <LinearGradient colors={gradientColors} style={styles.headerGradient}>
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <Text style={styles.headerTitle}>{title}</Text>

        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  }
});
