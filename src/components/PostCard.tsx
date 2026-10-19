import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Post } from '../services/postsApi';
import { useTheme } from '../theme/ThemeContext';
import { formatDateTime, isEdited, timeAgo } from '../utils/formatDate';

type PostWithDates = Post & { createdAt?: string; updatedAt?: string };

type PostCardProps = {
  post: PostWithDates;
  onPress?: (post: PostWithDates) => void;
};

export default function PostCard({ post, onPress }: PostCardProps) {
  const { colors, radius, spacing } = useTheme();
  const date = post.createdAt ?? new Date().toISOString();
  const edited = !!post.createdAt && !!post.updatedAt && isEdited(post.createdAt, post.updatedAt);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(post)}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg }]}> 
        <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
        <Text style={[styles.body, { color: colors.subtext }]} numberOfLines={2}>{post.body}</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: colors.subtext }]}>📅 {formatDateTime(date)}</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={[styles.meta, { color: colors.subtext }]}>🕒 {timeAgo(date)}</Text>
          {edited && (
            <View style={[styles.badge, { backgroundColor: `${colors.accent}15`, borderColor: colors.accent }]}>
              <Text style={[styles.badgeText, { color: colors.accent }]}>Edited</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    elevation: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    marginTop: 12,
  },
  footerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  meta: {
    fontSize: 12,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});






