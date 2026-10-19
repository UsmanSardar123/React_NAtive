import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import PostForm from '../components/PostForm';
import PostCard from '../components/PostCard';
import PostList from '../components/PostList';
import ScreenHeader from '../components/ScreenHeader';
import { Toast, useToast } from '../components/Toast';
import useFetch from '../hooks/useFetch';
import useMutation from '../hooks/useMutation';
import { getPosts, updatePost, type Post } from '../services/postsApi';
import { useTheme } from '../theme/ThemeContext';

type Props = { onGoHome: () => void };

export default function UpdatePostScreen({ onGoHome }: Props) {
  const { colors, spacing, radius } = useTheme();
  const [selected, setSelected] = useState<Post | null>(null);
  const [query, setQuery] = useState('');
  const { data: posts, loading, error, reload } = useFetch(getPosts);
  const mutation = useMutation(updatePost);
  const { toast, showToast } = useToast();
  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (posts ?? []).filter((post) =>
      `${post.title} ${post.body}`.toLowerCase().includes(normalizedQuery),
    );
  }, [posts, query]);

  useEffect(() => {
    if (mutation.success) showToast('Post updated', 'success');
  }, [mutation.success, showToast]);

  useEffect(() => {
    if (mutation.error) showToast(mutation.error, 'error');
  }, [mutation.error, showToast]);

  async function savePost(post: { title: string; body: string }) {
    if (!selected) return;
    const updated = await mutation.run(selected._id, post);
    setSelected(updated);
    await reload();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}> 
      <ScreenHeader title="Update Post" onGoHome={onGoHome} />
      {selected ? (
        <ScrollView keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setSelected(null)}><Text style={[styles.back, { color: colors.accent }]}>‹ Choose a different post</Text></Pressable>
          <PostCard post={selected} selected />
          <PostForm
            key={selected._id}
            initialTitle={selected.title}
            initialBody={selected.body}
            submitLabel="Save Changes"
            onSubmit={savePost}
            loading={mutation.loading}
            error={mutation.error}
            success={mutation.success}
          />
        </ScrollView>
      ) : loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /><Text style={[styles.message, { color: colors.subtext }]}>Loading posts...</Text></View> :
        error ? <View style={styles.center}><Text style={[styles.error, { color: colors.danger }]}>{error}</Text><Pressable onPress={reload}><Text style={[styles.back, { color: colors.accent }]}>Try again</Text></Pressable></View> :
          <>
            <Text style={[styles.hint, { color: colors.subtext }]}>Search and choose a post to edit.</Text>
            <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md }]}>
              <Text style={[styles.searchIcon, { color: colors.subtext }]}>⌕</Text>
              <TextInput
                accessibilityLabel="Search posts to update"
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
              emptyMessage={query ? 'No matching posts to update.' : 'No posts to update.'}
              onSelect={setSelected}
              actionIcon="✎"
              actionColor={colors.accent}
            />
          </>}
      {toast && <Toast message={toast.message} type={toast.type} visible={toast.visible} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', gap: 12 },
  message: { fontSize: 16 },
  hint: { marginBottom: 10 },
  back: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  error: { textAlign: 'center' },
  searchRow: { alignItems: 'center', borderWidth: 1, flexDirection: 'row', marginBottom: 12, paddingVertical: 10 },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  clearText: { fontSize: 14, fontWeight: '600' },
});
