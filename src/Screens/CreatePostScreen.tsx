import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import PostForm from '../components/PostForm';
import ScreenHeader from '../components/ScreenHeader';
import useMutation from '../hooks/useMutation';
import { createPost } from '../services/postsApi';
import { useTheme } from '../theme/ThemeContext';

type Props = { onGoHome: () => void };

export default function CreatePostScreen({ onGoHome }: Props) {
  const { colors, spacing } = useTheme();
  const mutation = useMutation(createPost);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="Create Post" onGoHome={onGoHome} />
      <View>
        <PostForm
          submitLabel="Create Post"
          onSubmit={mutation.run}
          loading={mutation.loading}
          error={mutation.error}
          success={mutation.success}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ container: { flexGrow: 1 } });
