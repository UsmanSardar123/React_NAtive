import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import type { Post } from '../services/postsApi';
import { useTheme } from '../theme/ThemeContext';
import PostCard from './PostCard';

type PostWithDates = Post & { createdAt?: string; updatedAt?: string };

type PostListProps = {
  posts: PostWithDates[];
  emptyMessage?: string;
  _actionLabel?: string;
  onSelect?: (post: PostWithDates) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
  selectedPostId?: string | null;
  actionIcon?: string;
  actionColor?: string;
};

export default function PostList({
  posts,
  emptyMessage = 'No posts yet.',
  _actionLabel,
  onSelect,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
  selectedPostId = null,
  actionIcon,
  actionColor,
}: PostListProps) {
  const { colors } = useTheme();

  return (
    <FlatList
      data={posts}
      style={styles.listContainer}
      keyExtractor={(post) => post._id}
      contentContainerStyle={posts.length === 0 ? styles.emptyContainer : styles.list}
      ListHeaderComponent={ListHeaderComponent || undefined}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }
      ListEmptyComponent={<Text style={[styles.empty, { color: colors.subtext }]}>{emptyMessage}</Text>}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPress={onSelect}
          selected={item._id === selectedPostId}
          actionIcon={actionIcon}
          actionColor={actionColor}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: { flex: 1 },
  list: { paddingBottom: 24 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  empty: { fontSize: 16, textAlign: 'center' },
});
