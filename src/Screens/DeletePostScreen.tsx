import React from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import PostList from '../components/PostList';
import ScreenHeader from '../components/ScreenHeader';
import useFetch from '../hooks/useFetch';
import useMutation from '../hooks/useMutation';
import { deletePost, getPosts, type Post } from '../services/postsApi';
import { useTheme } from '../theme/ThemeContext';

type Props = { onGoHome: () => void };

export default function DeletePostScreen({ onGoHome }: Props) {
  const { colors, spacing } = useTheme();
  const { data: posts, loading, error, reload } = useFetch(getPosts);
  const mutation = useMutation(deletePost);

  function confirmDelete(post: Post) {
    Alert.alert('Delete post?', `Delete “${post.title}”? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { removePost(post).catch(() => undefined); } },
    ]);
  }

  async function removePost(post: Post) {
    await mutation.run(post._id);
    await reload();
  }

  const visibleError = error ?? mutation.error;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}> 
      <ScreenHeader title="Delete Post" onGoHome={onGoHome} />
      {!!visibleError && <Text style={[styles.error, { color: colors.danger }]}>{visibleError}</Text>}
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /><Text style={[styles.message, { color: colors.subtext }]}>Loading posts...</Text></View> :
        <><Text style={[styles.hint, { color: colors.subtext }]}>Choose a post, then confirm deletion.</Text><PostList posts={posts ?? []} emptyMessage="No posts to delete." onSelect={confirmDelete} />
          {mutation.loading && <View style={styles.busy}><ActivityIndicator color={colors.accent} /><Text style={[styles.message, { color: colors.subtext }]}>Deleting post...</Text></View>}
          {!visibleError && posts?.length === 0 && <Pressable onPress={reload}><Text style={[styles.retry, { color: colors.accent }]}>Refresh posts</Text></Pressable>}
        </>}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, center: { alignItems: 'center', flex: 1, justifyContent: 'center', gap: 12 }, busy: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'center', padding: 16 }, message: { fontSize: 16 }, hint: { marginBottom: 14 }, error: { marginBottom: 12 }, retry: { fontSize: 16, padding: 10, textAlign: 'center' } });
