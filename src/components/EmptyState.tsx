import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type EmptyStateProps = {
  icon?: string;
  title: string;
  subtitle?: string;
};

export default function EmptyState({ icon = '▤', title, subtitle }: EmptyStateProps) {
  const { colors, spacing, fontSizes } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xl }]}>
      <Text accessibilityElementsHidden style={styles.iconText}>{icon}</Text>
      <Text style={[styles.title, { color: colors.text, fontSize: fontSizes.lg, marginTop: spacing.md }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.subtext, fontSize: fontSizes.md, marginTop: spacing.sm }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  iconText: { color: '#64748B', fontSize: 44 },
  title: { fontWeight: '600', textAlign: 'center' },
  subtitle: { textAlign: 'center' },
});
