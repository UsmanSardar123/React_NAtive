import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import EmptyState from '../components/EmptyState';
import UserCard from '../components/UserCard';
import UserForm from '../components/UserForm';
import useFetch from '../hooks/useFetch';
import useMutation from '../hooks/useMutation';
import { createUser, deleteUser, getUsers, updateUser, type User, type UserStatus } from '../services/usersApi';
import { useTheme } from '../theme/ThemeContext';
import { formatDateTime } from '../utils/formatDate';

type StatusFilter = 'All' | UserStatus;
const statusFilters: StatusFilter[] = ['All', 'Active', 'Inactive', 'Pending'];

export default function UsersScreen() {
  const { colors, spacing, radius } = useTheme();
  const { data: users, loading, error, reload, setData } = useFetch(getUsers);
  const createMutation = useMutation(createUser);
  const updateMutation = useMutation(updateUser);
  const deleteMutation = useMutation(deleteUser);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [formVisible, setFormVisible] = useState(false);
  const [formSession, setFormSession] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const deleting = useRef(false);

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return (users ?? []).filter((user) => {
      const matchesQuery = `${user.fullName} ${user.email}`.toLowerCase().includes(normalizedQuery);
      return matchesQuery && (statusFilter === 'All' || user.status === statusFilter);
    });
  }, [query, statusFilter, users]);

  function openCreate() {
    setEditingUser(null);
    setFormSession((current) => current + 1);
    setFormVisible(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);
    setFormSession((current) => current + 1);
    setFormVisible(true);
  }

  function closeForm() {
    if (createMutation.loading || updateMutation.loading) return;
    setFormVisible(false);
    setEditingUser(null);
  }

  async function saveUser(input: Parameters<typeof createUser>[0]) {
    if (editingUser) {
      const updated = await updateMutation.run(editingUser._id, input);
      setData((current) => current ? current.map((user) => user._id === updated._id ? updated : user) : [updated]);
      setDetailUser((current) => current?._id === updated._id ? updated : current);
    } else {
      const created = await createMutation.run(input);
      setData((current) => [created, ...(current ?? [])]);
    }
    setFormVisible(false);
    setEditingUser(null);
  }

  function askToDelete(user: User) {
    if (deleting.current || deleteMutation.loading) return;
    Alert.alert('Delete user?', `Remove ${user.fullName} from the directory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (deleting.current) return;
          deleting.current = true;
          setDeleteError('');
          removeUser(user);
        },
      },
    ]);
  }

  async function removeUser(user: User) {
    try {
      await deleteMutation.run(user._id);
      setData((current) => current?.filter((item) => item._id !== user._id) ?? null);
      if (detailUser?._id === user._id) setDetailUser(null);
    } catch (deleteRequestError) {
      setDeleteError(deleteRequestError instanceof Error ? deleteRequestError.message : 'Unable to delete this user.');
    } finally {
      deleting.current = false;
    }
  }

  const header = (
    <View>
      <View style={styles.topRow}>
        <Text style={[styles.eyebrow, { color: colors.subtext }]}>PEOPLE</Text>
        <Pressable accessibilityRole="button" onPress={openCreate} style={[styles.addButton, { backgroundColor: colors.accent, borderRadius: radius.md }]}>
          <Text style={styles.addButtonText}>+ Add user</Text>
        </Pressable>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>User directory</Text>
      <Text style={[styles.subtitle, { color: colors.subtext }]}>Manage profiles and keep your team connected.</Text>

      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md }]}>
        <Text style={[styles.searchGlyph, { color: colors.subtext }]}>Search</Text>
        <TextInput
          accessibilityLabel="Search users by name or email"
          value={query}
          onChangeText={setQuery}
          placeholder="Name or email"
          placeholderTextColor={colors.subtext}
          autoCapitalize="none"
          style={[styles.searchInput, { color: colors.text }]}
        />
        {!!query && <Pressable accessibilityRole="button" onPress={() => setQuery('')}><Text style={[styles.clear, { color: colors.accent }]}>Clear</Text></Pressable>}
      </View>

      <View style={styles.filterRow}>
        {statusFilters.map((filter) => {
          const selected = filter === statusFilter;
          return (
            <Pressable
              key={filter}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setStatusFilter(filter)}
              style={[styles.filterChip, styles.roundedChip, { borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? `${colors.accent}15` : colors.card }]}
            >
              <Text style={[styles.filterText, { color: selected ? colors.accent : colors.subtext }]}>{filter}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.count, { color: colors.subtext }]}>{visibleUsers.length} of {users?.length ?? 0} users</Text>
      {!!deleteError && <Text accessibilityRole="alert" style={[styles.errorBanner, { color: colors.danger }]}>{deleteError}</Text>}
      {!!error && !!users && <Text accessibilityRole="alert" style={[styles.errorBanner, { color: colors.danger }]}>{error}</Text>}
    </View>
  );

  if (detailUser) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
        {!!deleteError && <Text accessibilityRole="alert" style={[styles.errorBanner, { color: colors.danger }]}>{deleteError}</Text>}
        <DetailView user={detailUser} onBack={() => setDetailUser(null)} onEdit={() => openEdit(detailUser)} onDelete={() => askToDelete(detailUser)} />
        <UserFormModal
          visible={formVisible}
          user={editingUser}
          session={formSession}
          loading={createMutation.loading || updateMutation.loading}
          onClose={closeForm}
          onSubmit={saveUser}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingTop: spacing.md }]}>
      {loading && !users ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.centerText, { color: colors.subtext }]}>Loading users…</Text>
        </View>
      ) : error && !users ? (
        <View style={styles.center}>
          <Text style={[styles.fetchError, { color: colors.danger }]}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={reload} style={[styles.retryButton, { backgroundColor: colors.accent, borderRadius: radius.md }]}>
            <Text style={styles.addButtonText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={visibleUsers}
          keyExtractor={(user) => user._id}
          ListHeaderComponent={header}
          ListEmptyComponent={(
            <View style={styles.emptyState}>
              <EmptyState
                title={users?.length ? 'No users match these filters' : 'No users yet'}
                subtitle={users?.length ? 'Try another search or status.' : 'Add a user to start building your directory.'}
                icon="○"
              />
              {!users?.length && (
                <Pressable accessibilityRole="button" onPress={openCreate} style={[styles.emptyAddButton, { backgroundColor: colors.accent, borderRadius: radius.md }]}>
                  <Text style={styles.addButtonText}>Add your first user</Text>
                </Pressable>
              )}
            </View>
          )}
          contentContainerStyle={visibleUsers.length ? styles.listContent : styles.emptyList}
          renderItem={({ item }) => (
            <UserCard user={item} onView={setDetailUser} onEdit={openEdit} onDelete={askToDelete} />
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.accent} colors={[colors.accent]} />}
          showsVerticalScrollIndicator={false}
        />
      )}
      <UserFormModal
        visible={formVisible}
        user={editingUser}
        session={formSession}
        loading={createMutation.loading || updateMutation.loading}
        onClose={closeForm}
        onSubmit={saveUser}
      />
    </View>
  );
}

function UserFormModal({
  visible,
  user,
  session,
  loading,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  user: User | null;
  session: number;
  loading: boolean;
  onClose: () => void;
  onSubmit: (input: Parameters<typeof createUser>[0]) => Promise<void>;
}) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close user form" onPress={onClose} style={styles.scrim} />
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.handle} />
          <UserForm key={`${user?._id ?? 'new-user'}-${session}`} initialUser={user} loading={loading} onCancel={onClose} onSubmit={onSubmit} />
        </View>
      </View>
    </Modal>
  );
}

function DetailView({ user, onBack, onEdit, onDelete }: { user: User; onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  const { colors, spacing, radius } = useTheme();
  const items: Array<[string, string | number | null | undefined]> = [
    ['Email', user.email], ['Phone', user.phoneNumber], ['Age', user.age], ['Gender', user.gender],
    ['Job title', user.jobTitle], ['Department', user.department], ['Role', user.role], ['Status', user.status],
    ['City', user.city], ['Country', user.country], ['Address', user.address], ['Profile image URL', user.profileImageUrl],
    ['Created', user.createdAt ? formatDateTime(user.createdAt) : undefined],
    ['Updated', user.updatedAt ? formatDateTime(user.updatedAt) : undefined],
  ];
  const initials = user.fullName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
      <View style={styles.detailNav}>
        <Pressable accessibilityRole="button" onPress={onBack}><Text style={[styles.back, { color: colors.accent }]}>‹ Users</Text></Pressable>
        <Text style={[styles.eyebrow, { color: colors.subtext }]}>PROFILE</Text>
      </View>
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg }]}>
        <View style={[styles.largeAvatar, { backgroundColor: `${colors.accent}18` }]}><Text style={[styles.largeInitials, { color: colors.accent }]}>{initials || '?'}</Text></View>
        <Text style={[styles.detailName, { color: colors.text }]}>{user.fullName}</Text>
        <Text style={[styles.detailSubtitle, { color: colors.subtext }]}>{[user.jobTitle, user.department].filter(Boolean).join(' · ') || 'Team member'}</Text>
        <View style={[styles.detailBadge, { backgroundColor: `${user.status === 'Active' ? colors.success : colors.accent}18` }]}>
          <Text style={[styles.filterText, { color: user.status === 'Active' ? colors.success : colors.accent }]}>{user.status}</Text>
        </View>
        <View style={styles.detailActions}>
          <Pressable accessibilityRole="button" onPress={onEdit} style={[styles.detailButton, { backgroundColor: colors.accent, borderRadius: radius.md }]}><Text style={styles.addButtonText}>Edit profile</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={onDelete} style={[styles.detailButton, styles.deleteButton, { borderColor: colors.border, borderRadius: radius.md }]}><Text style={[styles.deleteText, { color: colors.danger }]}>Delete</Text></Pressable>
        </View>
      </View>
      {!!user.bio && <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}><Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text><Text style={[styles.infoValue, { color: colors.subtext }]}>{user.bio}</Text></View>}
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile information</Text>
        {items.filter(([, value]) => value !== undefined && value !== null && value !== '').map(([label, value]) => (
          <View key={label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.subtext }]}>{label}</Text>
            <Text selectable style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  back: { fontSize: 14, fontWeight: '700', paddingVertical: 7 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  addButton: { alignItems: 'center', justifyContent: 'center', minHeight: 42, paddingHorizontal: 14 },
  addButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  title: { fontSize: 25, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 5 },
  searchWrap: { alignItems: 'center', borderWidth: 1, flexDirection: 'row', marginTop: 18, minHeight: 48, paddingHorizontal: 12 },
  searchGlyph: { fontSize: 12, fontWeight: '700', marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, minHeight: 46 },
  clear: { fontSize: 12, fontWeight: '700', padding: 6 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  filterChip: { borderWidth: 1, minHeight: 36, justifyContent: 'center', paddingHorizontal: 13 },
  roundedChip: { borderRadius: 999 },
  filterText: { fontSize: 12, fontWeight: '700' },
  count: { fontSize: 12, marginBottom: 12, marginTop: 14 },
  errorBanner: { fontSize: 13, marginBottom: 10 },
  listContent: { paddingBottom: 28 },
  emptyList: { flexGrow: 1, paddingBottom: 28 },
  emptyState: { alignItems: 'center' },
  emptyAddButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, marginTop: 12, paddingHorizontal: 18 },
  center: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', padding: 24 },
  centerText: { fontSize: 14 },
  fetchError: { fontSize: 14, textAlign: 'center' },
  retryButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, paddingHorizontal: 18 },
  modalRoot: { backgroundColor: '#00000066', flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill },
  sheet: { backgroundColor: '#F8FAFC', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '94%', minHeight: '65%', overflow: 'hidden', paddingTop: 10 },
  handle: { alignSelf: 'center', backgroundColor: '#CBD5E1', borderRadius: 99, height: 4, marginBottom: 4, width: 42 },
  detailContent: { paddingBottom: 32 },
  detailNav: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  profileCard: { alignItems: 'center', borderWidth: 1, marginBottom: 12 },
  largeAvatar: { alignItems: 'center', borderRadius: 36, height: 72, justifyContent: 'center', width: 72 },
  largeInitials: { fontSize: 23, fontWeight: '700' },
  detailName: { fontSize: 21, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  detailSubtitle: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  detailBadge: { borderRadius: 999, marginTop: 12, paddingHorizontal: 11, paddingVertical: 6 },
  detailActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  detailButton: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 44 },
  deleteButton: { borderWidth: 1 },
  deleteText: { fontSize: 13, fontWeight: '700' },
  infoCard: { borderWidth: 1, marginBottom: 12, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  infoRow: { borderBottomWidth: StyleSheet.hairlineWidth, gap: 4, paddingVertical: 10 },
  infoLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  infoValue: { fontSize: 14, lineHeight: 20 },
});
