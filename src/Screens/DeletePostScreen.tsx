import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import PostList from '../components/PostList';
import ScreenHeader from '../components/ScreenHeader';
import { Toast, useToast } from '../components/Toast';
import useFetch from '../hooks/useFetch';
import useMutation from '../hooks/useMutation';
import { deletePost, getPosts, type Post } from '../services/postsApi';
import { useTheme } from '../theme/ThemeContext';

type Props = { onGoHome: () => void };

export default function DeletePostScreen({ onGoHome }: Props) {
  const { colors, spacing, radius } = useTheme();
  const [query, setQuery] = useState('');
  const { data: posts, loading, error, reload } = useFetch(getPosts);
  const mutation = useMutation(deletePost);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const deleting = useRef(false);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());
  const { toast, showToast } = useToast();
  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (posts ?? []).filter((post) =>
      !deletedIds.has(post._id)
      && `${post.title} ${post.body}`.toLowerCase().includes(normalizedQuery),
    );
  }, [deletedIds, posts, query]);

  useEffect(() => {
    if (mutation.success) showToast('Post deleted', 'success');
  }, [mutation.success, showToast]);

  useEffect(() => {
    if (mutation.error) showToast(mutation.error, 'error');
  }, [mutation.error, showToast]);

  function confirmDelete(post: Post) {
    if (deleting.current || mutation.loading || !post._id) return;
    Alert.alert('Delete post?', `Delete “${post.title}”? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (deleting.current) return;
          deleting.current = true;
          setSelectedPostId(post._id);
          removePost(post).catch(() => undefined);
        },
      },
    ]);
  }

  async function removePost(post: Post) {
    try {
      await mutation.run(post._id);
      setDeletedIds((current) => new Set(current).add(post._id));
      setSelectedPostId(null);
      await reload();
    } finally {
      deleting.current = false;
    }
  }

  const visibleError = mutation.error;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}> 
      <ScreenHeader title="Delete Post" onGoHome={onGoHome} />
      {!!visibleError && <Text style={[styles.error, { color: colors.danger }]}>{visibleError}</Text>}
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /><Text style={[styles.message, { color: colors.subtext }]}>Loading posts...</Text></View> : error ?
        <View style={styles.center}>
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
          <Pressable onPress={reload}><Text style={[styles.retry, { color: colors.accent }]}>Try again</Text></Pressable>
        </View> :
        <><Text style={[styles.hint, { color: colors.subtext }]}>Search and choose a post, then confirm deletion.</Text>
          <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md }]}>
            <Text style={[styles.searchIcon, { color: colors.subtext }]}>⌕</Text>
            <TextInput
              accessibilityLabel="Search posts to delete"
              value={query}
              onChangeText={setQuery}
              placeholder="Search posts"
              placeholderTextColor={colors.subtext}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {query ? <Pressable onPress={() => setQuery('')}><Text style={[styles.clearText, { color: colors.accent }]}>Clear</Text></Pressable> : null}
          </View>
          <PostList
            posts={filteredPosts}
            emptyMessage={query ? 'No matching posts to delete.' : 'No posts to delete.'}
            onSelect={confirmDelete}
            selectedPostId={selectedPostId}
            actionIcon="🗑"
            actionColor={colors.danger}
          />
          {mutation.loading && <View style={styles.busy}><ActivityIndicator color={colors.accent} /><Text style={[styles.message, { color: colors.subtext }]}>Deleting post...</Text></View>}
          {!visibleError && posts?.length === 0 && <Pressable onPress={reload}><Text style={[styles.retry, { color: colors.accent }]}>Refresh posts</Text></Pressable>}
        </>}
      {toast && <Toast message={toast.message} type={toast.type} visible={toast.visible} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', gap: 12 },
  busy: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'center', padding: 16 },
  message: { fontSize: 16 },
  hint: { marginBottom: 10 },
  error: { marginBottom: 12 },
  retry: { fontSize: 16, padding: 10, textAlign: 'center' },
  searchRow: { alignItems: 'center', borderWidth: 1, flexDirection: 'row', marginBottom: 12, paddingVertical: 10 },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  clearText: { fontSize: 14, fontWeight: '600' },
});
