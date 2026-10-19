import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type ScreenHeaderProps = { title: string; onGoHome: () => void };

export default function ScreenHeader({ title, onGoHome }: ScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, styles.headerSpacing]}> 
      <Text style={[styles.title, styles.titleFill, { color: colors.text }]}>{title}</Text>
      <Pressable accessibilityRole="button" onPress={onGoHome} hitSlop={10}>
        <Text style={[styles.home, { color: colors.accent }]}>Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerSpacing: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '700' },
  titleFill: { flex: 1 },
  home: { fontSize: 16, fontWeight: '600', marginLeft: 12 },
});
