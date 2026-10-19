import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import EmptyState from '../components/EmptyState';
import PostList from '../components/PostList';
import ScreenHeader from '../components/ScreenHeader';
import SkeletonCard from '../components/SkeletonCard';
import useFetch from '../hooks/useFetch';
import { getPosts, type Post } from '../services/postsApi';
import { useTheme } from '../theme/ThemeContext';

type PostWithDates = Post & { createdAt?: string; updatedAt?: string };

type Props = { onGoHome: () => void };

export default function ReadPostsScreen({ onGoHome }: Props) {
  const { colors, spacing, radius } = useTheme();
  const { data: posts, loading, error, reload } = useFetch(getPosts);
  const [query, setQuery] = useState('');
  const [sortNewest, setSortNewest] = useState(true);

  const visiblePosts = useMemo(() => {
    const base = [...((posts ?? []) as PostWithDates[])].filter((post) => {
      const haystack = `${post.title} ${post.body}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });

    base.sort((a, b) => {
      const aTime = new Date(a.createdAt ?? 0).getTime();
      const bTime = new Date(b.createdAt ?? 0).getTime();
      return sortNewest ? bTime - aTime : aTime - bTime;
    });

    return base;
  }, [posts, query, sortNewest]);

  const renderHeader = (
    <View style={{ marginBottom: spacing.md }}>
      <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm }]}> 
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search posts"
          placeholderTextColor={colors.subtext}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')}>
            <Text style={[styles.clearText, { color: colors.accent }]}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.toolbar}>
        <Text style={[styles.resultCount, { color: colors.subtext }]}>{visiblePosts.length} posts</Text>
        <Pressable
          onPress={() => setSortNewest((current) => !current)}
          style={[styles.sortToggle, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}
        >
          <Text style={[styles.sortText, { color: colors.text }]}>{sortNewest ? 'Newest' : 'Oldest'}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}> 
      <ScreenHeader title="Read Posts" onGoHome={onGoHome} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.message, { color: colors.subtext }]}>Loading posts...</Text>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
          <Pressable onPress={reload}>
            <Text style={[styles.retry, { color: colors.accent }]}>Try again</Text>
          </Pressable>
        </View>
      ) : visiblePosts.length === 0 ? (
        <View style={styles.center}>
          {query ? (
            <EmptyState title="No matching posts" subtitle="Try another search term." icon="⌕" />
          ) : (
            <EmptyState title="No posts yet" subtitle="Create a post to get started." icon="▤" />
          )}
        </View>
      ) : (
        <PostList
          posts={visiblePosts}
          emptyMessage={query ? 'No matching posts' : 'No posts found.'}
          ListHeaderComponent={renderHeader || undefined}
          onRefresh={reload}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', gap: 12 },
  message: { fontSize: 16 },
  error: { textAlign: 'center' },
  retry: { fontSize: 16, fontWeight: '600', padding: 8 },
  searchRow: { alignItems: 'center', borderWidth: 1, flexDirection: 'row', paddingHorizontal: 12 },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16 },
  clearText: { fontSize: 14, fontWeight: '600' },
  toolbar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  resultCount: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  sortToggle: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  sortText: { fontSize: 14, fontWeight: '600' },
});
