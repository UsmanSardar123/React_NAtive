import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import UsersScreen from './src/Screens/UsersScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppShell() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={[styles.container, { backgroundColor: colors.background }]}>
        <UsersScreen />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
