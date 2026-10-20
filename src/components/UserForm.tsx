import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { User, UserInput, UserRole, UserStatus } from '../services/usersApi';
import { useTheme } from '../theme/ThemeContext';

type UserFormProps = {
  initialUser?: User | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (user: UserInput) => Promise<void>;
};

type FormValues = {
  fullName: string;
  email: string;
  phoneNumber: string;
  age: string;
  gender: string;
  profileImageUrl: string;
  jobTitle: string;
  department: string;
  city: string;
  country: string;
  address: string;
  bio: string;
};

function valuesFrom(user?: User | null): FormValues {
  return {
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    age: user?.age == null ? '' : String(user.age),
    gender: user?.gender ?? '',
    profileImageUrl: user?.profileImageUrl ?? '',
    jobTitle: user?.jobTitle ?? '',
    department: user?.department ?? '',
    city: user?.city ?? '',
    country: user?.country ?? '',
    address: user?.address ?? '',
    bio: user?.bio ?? '',
  };
}

function Section({ title }: { title: string }) {
  const { colors } = useTheme();
  return <Text style={[styles.section, { color: colors.text, borderBottomColor: colors.border }]}>{title}</Text>;
}

type FieldProps = {
  label: string;
  value: string;
  error?: string;
  editable: boolean;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength: number;
  multiline?: boolean;
};

function Field({
  label,
  value,
  error,
  editable,
  placeholder,
  onChangeText,
  keyboardType,
  autoCapitalize,
  maxLength,
  multiline = false,
}: FieldProps) {
  const { colors, radius } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'words'}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multiline, { color: colors.text, backgroundColor: colors.background, borderColor: error ? colors.danger : colors.border, borderRadius: radius.md }]}
      />
      {!!error && <Text style={[styles.fieldError, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

type ChoiceFieldProps<T extends string> = {
  label: string;
  value: T;
  options: T[];
  disabled: boolean;
  onChange: (value: T) => void;
};

function ChoiceField<T extends string>({ label, value, options, disabled, onChange }: ChoiceFieldProps<T>) {
  const { colors, radius } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={styles.choices}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={disabled}
              onPress={() => onChange(option)}
              style={[styles.choice, { borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? `${colors.accent}15` : colors.card, borderRadius: radius.md }]}
            >
              <Text style={[styles.choiceText, { color: selected ? colors.accent : colors.subtext }]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function UserForm({ initialUser, loading = false, onCancel, onSubmit }: UserFormProps) {
  const { colors, radius, spacing } = useTheme();
  const [values, setValues] = useState(() => valuesFrom(initialUser));
  const [status, setStatus] = useState<UserStatus>(initialUser?.status ?? 'Active');
  const [role, setRole] = useState<UserRole>(initialUser?.role ?? 'User');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');
  const submitting = useRef(false);
  const isEditing = !!initialUser;

  function change(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setSaveError('');
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  async function handleSubmit() {
    if (submitting.current || loading) return;

    const nextErrors: Record<string, string> = {};
    const fullName = values.fullName.trim();
    const email = values.email.trim().toLowerCase();
    if (!fullName) nextErrors.fullName = 'Full name is required.';
    if (!email) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (values.age && (!/^\d+$/.test(values.age) || Number(values.age) < 1 || Number(values.age) > 120)) {
      nextErrors.age = 'Age must be a whole number between 1 and 120.';
    }
    if (values.profileImageUrl.trim()) {
      try {
        const imageUrl = new URL(values.profileImageUrl.trim());
        if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new Error('Invalid protocol');
      } catch {
        nextErrors.profileImageUrl = 'Enter a valid HTTP or HTTPS URL.';
      }
    }

    setErrors(nextErrors);
    setSaveError('');
    if (Object.keys(nextErrors).length) return;

    submitting.current = true;
    const payload: UserInput = {
      fullName,
      email,
      phoneNumber: values.phoneNumber.trim(),
      gender: values.gender.trim(),
      profileImageUrl: values.profileImageUrl.trim(),
      jobTitle: values.jobTitle.trim(),
      department: values.department.trim(),
      city: values.city.trim(),
      country: values.country.trim(),
      address: values.address.trim(),
      bio: values.bio.trim(),
      status,
      role,
      ...(values.age ? { age: Number(values.age) } : isEditing && initialUser?.age != null ? { age: null } : {}),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save this user.');
    } finally {
      submitting.current = false;
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView
        contentContainerStyle={[styles.content, { padding: spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formHeader}>
          <View style={styles.flex}>
            <Text style={[styles.title, { color: colors.text }]}>{isEditing ? 'Edit user' : 'Add user'}</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>Keep profile details up to date.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close form" disabled={loading} onPress={onCancel} hitSlop={10}>
            <Text style={[styles.close, { color: colors.subtext }]}>Close</Text>
          </Pressable>
        </View>

        <Section title="Basic information" />
        <Field label="Full name *" value={values.fullName} error={errors.fullName} editable={!loading} maxLength={100} placeholder="e.g. Maya Chen" onChangeText={(value) => change('fullName', value)} />
        <Field label="Email *" value={values.email} error={errors.email} editable={!loading} keyboardType="email-address" autoCapitalize="none" maxLength={254} placeholder="name@example.com" onChangeText={(value) => change('email', value)} />
        <Field label="Phone number" value={values.phoneNumber} editable={!loading} keyboardType="phone-pad" maxLength={30} placeholder="Optional" onChangeText={(value) => change('phoneNumber', value)} />

        <Section title="Personal details" />
        <Field label="Age" value={values.age} error={errors.age} editable={!loading} keyboardType="number-pad" maxLength={3} placeholder="Optional" onChangeText={(value) => change('age', value)} />
        <Field label="Gender" value={values.gender} editable={!loading} maxLength={50} placeholder="Optional" onChangeText={(value) => change('gender', value)} />
        <Field label="Profile image URL" value={values.profileImageUrl} error={errors.profileImageUrl} editable={!loading} keyboardType="url" autoCapitalize="none" maxLength={2048} placeholder="https://example.com/photo.jpg" onChangeText={(value) => change('profileImageUrl', value)} />

        <Section title="Work information" />
        <Field label="Job title" value={values.jobTitle} editable={!loading} maxLength={100} placeholder="Optional" onChangeText={(value) => change('jobTitle', value)} />
        <Field label="Department" value={values.department} editable={!loading} maxLength={100} placeholder="Optional" onChangeText={(value) => change('department', value)} />
        <ChoiceField<UserRole> label="Role" value={role} options={['User', 'Admin', 'Manager']} disabled={loading} onChange={setRole} />
        <ChoiceField<UserStatus> label="Status" value={status} options={['Active', 'Inactive', 'Pending']} disabled={loading} onChange={setStatus} />

        <Section title="Location" />
        <Field label="City" value={values.city} editable={!loading} maxLength={100} placeholder="Optional" onChangeText={(value) => change('city', value)} />
        <Field label="Country" value={values.country} editable={!loading} maxLength={100} placeholder="Optional" onChangeText={(value) => change('country', value)} />
        <Field label="Address" value={values.address} editable={!loading} maxLength={300} placeholder="Optional" onChangeText={(value) => change('address', value)} />

        <Section title="About" />
        <Field label="Bio" value={values.bio} editable={!loading} maxLength={500} multiline placeholder="A short introduction (optional)" onChangeText={(value) => change('bio', value)} />
        <Text style={[styles.counter, { color: colors.subtext }]}>{values.bio.length}/500</Text>

        {!!saveError && <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>{saveError}</Text>}
        <View style={styles.footer}>
          <Pressable accessibilityRole="button" disabled={loading} onPress={onCancel} style={[styles.cancelButton, { borderColor: colors.border, borderRadius: radius.md }]}>
            <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={loading} onPress={handleSubmit} style={[styles.saveButton, { backgroundColor: colors.accent, borderRadius: radius.md }, loading && styles.disabled]}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>{isEditing ? 'Save changes' : 'Add user'}</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 32 },
  formHeader: { alignItems: 'center', flexDirection: 'row', marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4 },
  close: { fontSize: 14, fontWeight: '600', padding: 8 },
  section: { borderBottomWidth: StyleSheet.hairlineWidth, fontSize: 15, fontWeight: '700', marginBottom: 4, marginTop: 22, paddingBottom: 8 },
  field: { marginTop: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, fontSize: 15, minHeight: 46, paddingHorizontal: 12, paddingVertical: 10 },
  multiline: { minHeight: 110 },
  fieldError: { fontSize: 12, marginTop: 5 },
  counter: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderWidth: 1, minHeight: 40, justifyContent: 'center', paddingHorizontal: 12 },
  choiceText: { fontSize: 13, fontWeight: '600' },
  error: { fontSize: 13, marginTop: 14 },
  footer: { flexDirection: 'row', gap: 10, marginTop: 24 },
  cancelButton: { alignItems: 'center', borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 48 },
  cancelText: { fontSize: 14, fontWeight: '600' },
  saveButton: { alignItems: 'center', flex: 1.4, justifyContent: 'center', minHeight: 48 },
  saveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.65 },
});
