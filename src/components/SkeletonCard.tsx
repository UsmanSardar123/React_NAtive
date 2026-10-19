import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function SkeletonCard() {
  const { colors, spacing, radius } = useTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.lg,
          marginBottom: spacing.md,
          opacity,
          padding: spacing.lg,
        },
      ]}
    >
      <View style={[styles.line, styles.firstLine, { backgroundColor: colors.border }]} />
      <View style={[styles.line, styles.bodyLine, styles.fullLine, { backgroundColor: colors.border }]} />
      <View style={[styles.line, styles.lastLine, { backgroundColor: colors.border }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, elevation: 2 },
  line: { borderRadius: 4, height: 14 },
  firstLine: { width: '60%' },
  fullLine: { width: '100%' },
  lastLine: { width: '82%' },
  bodyLine: { height: 12, marginBottom: 8, marginTop: 16 },
});
