import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from '../services/usersApi';
import { useTheme } from '../theme/ThemeContext';

type UserCardProps = {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export default function UserCard({ user, onView, onEdit, onDelete }: UserCardProps) {
  const { colors, spacing, radius } = useTheme();
  const statusColor = user.status === 'Active' ? colors.success : user.status === 'Pending' ? '#B45309' : colors.subtext;
  const subtitle = [user.jobTitle, user.department].filter(Boolean).join(' · ');

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`View ${user.fullName}`} onPress={() => onView(user)} style={styles.main}>
        <View style={[styles.avatar, { backgroundColor: `${colors.accent}18` }]}>
          <Text style={[styles.initials, { color: colors.accent }]}>{initials(user.fullName) || '?'}</Text>
        </View>
        <View style={styles.details}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>{user.fullName}</Text>
            <View style={[styles.status, { backgroundColor: `${statusColor}18` }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{user.status}</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={[styles.subtitle, { color: colors.subtext }]}>{subtitle || 'Team member'}</Text>
          <Text numberOfLines={1} style={[styles.email, { color: colors.subtext }]}>{user.email}</Text>
        </View>
      </Pressable>
      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        <Pressable accessibilityRole="button" onPress={() => onView(user)} hitSlop={8}>
          <Text style={[styles.action, { color: colors.accent }]}>Details</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => onEdit(user)} hitSlop={8}>
          <Text style={[styles.action, { color: colors.accent }]}>Edit</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => onDelete(user)} hitSlop={8}>
          <Text style={[styles.action, { color: colors.danger }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, marginBottom: 12 },
  main: { alignItems: 'center', flexDirection: 'row', minHeight: 64 },
  avatar: { alignItems: 'center', borderRadius: 24, height: 48, justifyContent: 'center', marginRight: 12, width: 48 },
  initials: { fontSize: 16, fontWeight: '700' },
  details: { flex: 1, minWidth: 0 },
  nameRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  name: { flex: 1, fontSize: 16, fontWeight: '700' },
  status: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },
  email: { fontSize: 13, marginTop: 3 },
  actions: { borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 24, justifyContent: 'flex-end', marginTop: 12, paddingTop: 10 },
  action: { fontSize: 13, fontWeight: '700', padding: 3 },
});
