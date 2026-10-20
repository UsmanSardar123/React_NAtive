import React, { useMemo, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import useFetch from '../hooks/useFetch';
import { getPosts, type Post } from '../services/postsApi';
import { useTheme } from '../theme/ThemeContext';
import { timeAgo } from '../utils/formatDate';

export type CrudAction = 'Create Post' | 'Read Posts' | 'Update Post' | 'Delete Post' | 'Manage Users';

type HomeScreenProps = {
  onSelectAction: (action: CrudAction) => void;
};

type PostWithDates = Post & { createdAt?: string; updatedAt?: string };

const actionMeta: Array<{ action: CrudAction; icon: string; tint: string }> = [
  { action: 'Manage Users', icon: 'U', tint: '#7C3AED' },
  { action: 'Create Post', icon: '✎', tint: '#4F46E5' },
  { action: 'Read Posts', icon: '☰', tint: '#0EA5E9' },
  { action: 'Update Post', icon: '✏️', tint: '#10B981' },
  { action: 'Delete Post', icon: '🗑', tint: '#EF4444' },
];

export default function HomeScreen({ onSelectAction }: HomeScreenProps) {
  const { colors, radius, fontSizes, isDark, toggleTheme } = useTheme();
  const { data: posts, loading, error, reload } = useFetch(getPosts);
  const [search, setSearch] = React.useState('');
  const matchedPosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [] as PostWithDates[];
    return ((posts ?? []) as PostWithDates[]).filter((post) => `${post.title} ${post.body}`.toLowerCase().includes(q));
  }, [posts, search]);
  const recentPosts = useMemo(
    () => [...((posts ?? []) as PostWithDates[])]
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .slice(0, 3),
    [posts],
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.label, { color: colors.subtext, fontSize: fontSizes.md }]}>Posts</Text>
            <Text style={[styles.title, { color: colors.text, fontSize: fontSizes.title }]}>{greeting}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={toggleTheme}
            style={[styles.themeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={{ fontSize: fontSizes.lg }}>{isDark ? '☀️' : '🌙'}</Text>
          </Pressable>
        </View>

        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}> 
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search any post"
            placeholderTextColor={colors.subtext}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Text style={[styles.clearText, { color: colors.accent }]}>Clear</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}> 
          <Text style={[styles.statsLabel, { color: colors.subtext }]}>Total posts</Text>
          {loading ? (
            <View style={styles.skeletonLine} />
          ) : error ? (
            <Text style={[styles.statsValue, { color: colors.subtext }]}>—</Text>
          ) : (
            <Text style={[styles.statsValue, { color: colors.text }]}>{posts?.length ?? 0}</Text>
          )}
          {!!error && (
            <View>
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              <Pressable accessibilityRole="button" onPress={reload}>
                <Text style={[styles.retryText, { color: colors.accent }]}>Retry connection</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.actionPanel}>
          <View style={styles.actionGrid}>
            {actionMeta.map(({ action, icon, tint }) => (
              <View key={action} style={styles.actionItem}>
                <ActionCard action={action} icon={icon} tint={tint} onSelectAction={onSelectAction} />
              </View>
            ))}
          </View>
        </View>

        {search ? (
          <View style={[styles.resultsSection, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}> 
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Matches</Text>
            {error ? (
              <Text style={[styles.emptyText, { color: colors.danger }]}>Posts could not be searched. Check the API connection and retry.</Text>
            ) : matchedPosts.length ? (
              matchedPosts.slice(0, 4).map((post) => (
                <Pressable key={post._id} onPress={() => onSelectAction('Read Posts')} style={[styles.recentItem, { borderColor: colors.border }]}> 
                  <Text style={[styles.recentTitle, { color: colors.text }]}>{post.title}</Text>
                  <Text style={[styles.recentMeta, { color: colors.subtext }]}>{post.body.slice(0, 80)}{post.body.length > 80 ? '…' : ''}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.subtext }]}>No post matches your search.</Text>
            )}
          </View>
        ) : (
          <View style={[styles.recentSection, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}> 
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent posts</Text>
            {loading ? (
              <View style={styles.loaderStack}>
                <View style={[styles.skeletonRow, { backgroundColor: colors.border }]} />
                <View style={[styles.skeletonRow, { backgroundColor: colors.border }]} />
                <View style={[styles.skeletonRow, { backgroundColor: colors.border }]} />
              </View>
            ) : error ? (
              <Text style={[styles.emptyText, { color: colors.danger }]}>Posts could not be loaded. Check the API connection and retry.</Text>
            ) : recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Pressable
                  key={post._id}
                  onPress={() => onSelectAction('Read Posts')}
                  style={[styles.recentItem, { borderColor: colors.border }]}
                >
                  <Text style={[styles.recentTitle, { color: colors.text }]}>{post.title}</Text>
                  <Text style={[styles.recentMeta, { color: colors.subtext }]}>{timeAgo(post.createdAt ?? new Date().toISOString())}</Text>
                </Pressable>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.subtext }]}>No posts yet</Text>
            )}
          </View>
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open user directory"
        onPress={() => onSelectAction('Manage Users')}
        style={[styles.fab, { backgroundColor: colors.accent }]}
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
}

type ActionCardProps = {
  action: CrudAction;
  icon: string;
  tint: string;
  onSelectAction: (action: CrudAction) => void;
};

function ActionCard({ action, icon, tint, onSelectAction }: ActionCardProps) {
  const { colors, radius } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, friction: 7, tension: 200 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 200 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onSelectAction(action)}
        style={({ pressed }) => [
          styles.cardButton,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.lg,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View style={[styles.cardIcon, { backgroundColor: `${tint}20` }]}> 
          <Text style={[styles.iconText, { color: tint }]}>{icon}</Text>
        </View>
        <Text style={[styles.cardLabel, { color: colors.text }]}>{action}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 90,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontWeight: '700',
  },
  themeButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  searchWrap: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsCard: {
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statsValue: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
  },
  errorText: {
    marginTop: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  actionPanel: {
    marginBottom: 18,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    marginBottom: 12,
    width: '48%',
  },
  cardButton: {
    borderWidth: 1,
    height: 130,
    justifyContent: 'center',
    padding: 16,
    width: '100%',
  },
  cardIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    marginBottom: 12,
    width: 44,
  },
  iconText: {
    fontSize: 20,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  resultsSection: {
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
  },
  recentSection: {
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  recentItem: {
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recentMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
  },
  fab: {
    alignItems: 'center',
    borderRadius: 28,
    bottom: 24,
    elevation: 6,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    width: 56,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 28,
  },
  skeletonLine: {
    backgroundColor: '#D8DEE9',
    borderRadius: 8,
    height: 20,
    marginTop: 8,
    width: 80,
  },
  loaderStack: {
    gap: 10,
  },
  skeletonRow: {
    borderRadius: 8,
    height: 14,
    width: '100%',
  },
});
