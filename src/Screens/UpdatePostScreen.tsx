import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import PostForm from '../components/PostForm';
import PostList from '../components/PostList';
import ScreenHeader from '../components/ScreenHeader';
import useFetch from '../hooks/useFetch';
import useMutation from '../hooks/useMutation';
import { getPosts, updatePost, type Post } from '../services/postsApi';
import { useTheme } from '../theme/ThemeContext';

type Props = { onGoHome: () => void };

export default function UpdatePostScreen({ onGoHome }: Props) {
  const { colors, spacing } = useTheme();
  const [selected, setSelected] = useState<Post | null>(null);
  const { data: posts, loading, error, reload } = useFetch(getPosts);
  const mutation = useMutation(updatePost);

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
          <><Text style={[styles.hint, { color: colors.subtext }]}>Choose a post to edit.</Text><PostList posts={posts ?? []} emptyMessage="No posts to update." onSelect={setSelected} /></>}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, center: { alignItems: 'center', flex: 1, justifyContent: 'center', gap: 12 }, message: { fontSize: 16 }, hint: { marginBottom: 14 }, back: { fontSize: 16, fontWeight: '600', marginBottom: 8 }, error: { textAlign: 'center' } });
