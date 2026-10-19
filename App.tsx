import React, { useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen, { type CrudAction } from './src/Screens/HomeScreen';
import CreatePostScreen from './src/Screens/CreatePostScreen';
import ReadPostsScreen from './src/Screens/ReadPostsScreen';
import UpdatePostScreen from './src/Screens/UpdatePostScreen';
import DeletePostScreen from './src/Screens/DeletePostScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

function AppShell() {
  const [selectedAction, setSelectedAction] = useState<CrudAction | null>(null);
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={[styles.container, { backgroundColor: colors.background }]}>
        {selectedAction ? (
          selectedAction === 'Create Post' ? (
            <CreatePostScreen
              onGoHome={() => setSelectedAction(null)}
              onCreated={() => setSelectedAction('Read Posts')}
            />
          ) :
            selectedAction === 'Read Posts' ? <ReadPostsScreen onGoHome={() => setSelectedAction(null)} /> :
              selectedAction === 'Update Post' ? <UpdatePostScreen onGoHome={() => setSelectedAction(null)} /> :
                <DeletePostScreen onGoHome={() => setSelectedAction(null)} />
        ) : (
          <HomeScreen onSelectAction={setSelectedAction} />
        )}
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
