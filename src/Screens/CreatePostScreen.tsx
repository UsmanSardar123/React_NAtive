import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import PostForm from '../components/PostForm';
import ScreenHeader from '../components/ScreenHeader';
import { Toast, useToast } from '../components/Toast';
import useMutation from '../hooks/useMutation';
import { createPost } from '../services/postsApi';
import { useTheme } from '../theme/ThemeContext';

type Props = { onGoHome: () => void; onCreated: () => void };

export default function CreatePostScreen({ onGoHome, onCreated }: Props) {
  const { colors, spacing } = useTheme();
  const mutation = useMutation(createPost);
  const { toast, showToast } = useToast();

  useEffect(() => {
    if (mutation.success) showToast('Post created', 'success');
  }, [mutation.success, showToast]);

  useEffect(() => {
    if (mutation.error) showToast(mutation.error, 'error');
  }, [mutation.error, showToast]);

  async function submitPost(post: { title: string; body: string }) {
    await mutation.run(post);
    onCreated();
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.lg }]} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Create Post" onGoHome={onGoHome} />
        <View>
          <PostForm
            submitLabel="Create Post"
            onSubmit={submitPost}
            loading={mutation.loading}
            error={mutation.error}
            success={mutation.success}
          />
        </View>
      </ScrollView>
      {toast && <Toast message={toast.message} type={toast.type} visible={toast.visible} />}
    </View>
  );
}

const styles = StyleSheet.create({ screen: { flex: 1 }, container: { flexGrow: 1 } });
