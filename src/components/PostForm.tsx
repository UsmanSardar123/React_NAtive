import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import type { PostInput } from '../services/postsApi';

type PostFormProps = {
  initialTitle?: string;
  initialBody?: string;
  submitLabel: string;
  initialname?: string;
  onSubmit: (post: PostInput) => Promise<unknown>;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
};

export default function PostForm({
  initialTitle = '',
  initialBody = '',
  submitLabel,
  onSubmit,
  loading: externalLoading,
  error: externalError,
  success: externalSuccess,
}: PostFormProps) {
  const { colors, radius } = useTheme();
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const loadingState = externalLoading ?? loading;
  const errorMessage = externalError ?? (isError ? message : null);
  const successMessage = externalSuccess ? 'Post saved successfully.' : (!isError ? message : '');
  const titleCount = useMemo(() => `${title.length}/100`, [title.length]);
  const bodyCount = useMemo(() => `${body.length}/1000`, [body.length]);

  async function handleSubmit() {
    if (!title.trim() || !body.trim()) {
      setIsError(true);
      setMessage('Enter both a title and body.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await onSubmit({ title: title.trim(), body: body.trim() });
      setIsError(false);
      setMessage('Post saved successfully.');
      if (submitLabel === 'Create Post') {
        setTitle('');
        setBody('');
      }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'Unable to save post.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <Text style={[styles.label, { color: colors.text }]}>Title</Text>
      <TextInput
        accessibilityLabel="Post title"
        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md, color: colors.text }]}
        placeholder="Enter a title"
        placeholderTextColor={colors.subtext}
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />
      <Text style={[styles.counter, { color: colors.subtext }]}>{titleCount}</Text>

      <Text style={[styles.label, { color: colors.text }]}>Body</Text>
      <TextInput
        accessibilityLabel="Post body"
        style={[styles.input, styles.bodyInput, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.md, color: colors.text }]}
        placeholder="Write your post"
        placeholderTextColor={colors.subtext}
        value={body}
        onChangeText={setBody}
        multiline
        maxLength={1000}
        textAlignVertical="top"
      />
      <Text style={[styles.counter, { color: colors.subtext }]}>{bodyCount}</Text>

      {!!errorMessage && <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text>}
      {!!successMessage && <Text style={[styles.success, { color: colors.success }]}>{successMessage}</Text>}
      <Pressable
        accessibilityRole="button"
        disabled={loadingState}
        onPress={handleSubmit}
        style={[styles.button, { backgroundColor: colors.accent, borderRadius: radius.md }, loadingState && styles.disabled]}
      >
        {loadingState ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{submitLabel}</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { fontSize: 16, padding: 13 },
  bodyInput: { minHeight: 150 },
  button: { alignItems: 'center', justifyContent: 'center', marginTop: 20, minHeight: 48, paddingHorizontal: 16 },
  disabled: { opacity: 0.65 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  error: { marginTop: 12 },
  success: { marginTop: 12 },
  counter: { fontSize: 12, marginTop: 4, textAlign: 'right' },
});
