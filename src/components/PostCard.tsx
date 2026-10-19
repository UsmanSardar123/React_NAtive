import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Post } from '../services/postsApi';
import { useTheme } from '../theme/ThemeContext';
import { formatDateTime, isEdited, timeAgo } from '../utils/formatDate';

type PostWithDates = Post & { createdAt?: string; updatedAt?: string };

type PostCardProps = {
  post: PostWithDates;
  onPress?: (post: PostWithDates) => void;
  selected?: boolean;
  actionIcon?: string;
  actionColor?: string;
};

export default function PostCard({ post, onPress, selected = false, actionIcon, actionColor }: PostCardProps) {
  const { colors, radius, spacing } = useTheme();
  const date = post.createdAt ?? new Date().toISOString();
  const edited = !!post.createdAt && !!post.updatedAt && isEdited(post.createdAt, post.updatedAt);

  return (
    <View style={[
      styles.card,
      selected ? styles.selectedCard : styles.unselectedCard,
      {
        backgroundColor: colors.card,
        borderColor: selected ? colors.accent : colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
      },
    ]}>
      <View style={styles.cardRow}>
        <Pressable
          accessibilityRole={onPress ? 'button' : undefined}
          onPress={() => onPress?.(post)}
          style={({ pressed }) => [styles.content, { opacity: pressed && onPress ? 0.9 : 1 }]}
        >
          <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
          <Text style={[styles.body, { color: colors.subtext }]}>{post.body}</Text>
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
        </Pressable>
        {onPress && actionIcon && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionIcon === '🗑' ? 'Delete post' : 'Edit post'}
            onPress={() => onPress(post)}
            style={[styles.actionButton, { backgroundColor: `${actionColor ?? colors.accent}15` }]}
          >
            <Text style={[styles.actionIcon, { color: actionColor ?? colors.accent }]}>{actionIcon}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 2,
    marginBottom: 12,
  },
  selectedCard: { borderWidth: 2 },
  unselectedCard: { borderWidth: 1 },
  cardRow: { alignItems: 'center', flexDirection: 'row' },
  content: { flex: 1 },
  actionButton: { alignItems: 'center', borderRadius: 10, height: 40, justifyContent: 'center', marginLeft: 10, width: 40 },
  actionIcon: { fontSize: 18, fontWeight: '700' },
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



