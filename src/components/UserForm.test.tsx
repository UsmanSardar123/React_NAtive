import React from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '../theme/ThemeContext';
import type { User } from '../services/usersApi';
import UserForm from './UserForm';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, writable: true });

jest.mock('react-native', () => {
  const mockReact = require('react');
  const mockHost = (name: string) => (props: Record<string, unknown>) =>
    mockReact.createElement(name, props, props.children);
  return {
    ActivityIndicator: mockHost('ActivityIndicator'),
    KeyboardAvoidingView: mockHost('KeyboardAvoidingView'),
    Platform: { OS: 'android' },
    Pressable: mockHost('Pressable'),
    ScrollView: mockHost('ScrollView'),
    Text: mockHost('Text'),
    TextInput: mockHost('TextInput'),
    View: mockHost('View'),
    StyleSheet: { create: (styles: unknown) => styles, hairlineWidth: 1, absoluteFill: {} },
  };
});

const user: User = {
  _id: 'user-1',
  fullName: 'Maya Chen',
  email: 'maya@example.com',
  status: 'Active',
  role: 'Manager',
};

describe('UserForm', () => {
  it('loads the selected user and validates required fields and email', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <UserForm initialUser={user} onCancel={jest.fn()} onSubmit={onSubmit} />
        </ThemeProvider>,
      );
    });

    const name = renderer!.root.findAllByType(TextInput).find((input) => input.props.accessibilityLabel === 'Full name *');
    const email = renderer!.root.findAllByType(TextInput).find((input) => input.props.accessibilityLabel === 'Email *');
    expect(name?.props.value).toBe('Maya Chen');
    expect(email?.props.value).toBe('maya@example.com');

    act(() => email?.props.onChangeText('not-an-email'));
    await act(async () => {
      const submit = renderer!.root.findAllByType(Pressable).at(-1);
      await submit?.props.onPress();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(renderer!.root.findAllByType(Text).some((node) => node.props.children === 'Enter a valid email address.')).toBe(true);
  });

  it('keeps entered values and displays the API error when saving fails', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('Email already exists.'));
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <UserForm onCancel={jest.fn()} onSubmit={onSubmit} />
        </ThemeProvider>,
      );
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    const name = inputs.find((input) => input.props.accessibilityLabel === 'Full name *');
    const email = inputs.find((input) => input.props.accessibilityLabel === 'Email *');
    act(() => {
      name?.props.onChangeText('Maya Chen');
      email?.props.onChangeText('maya@example.com');
    });

    await act(async () => {
      const submit = renderer!.root.findAllByType(Pressable).at(-1);
      await submit?.props.onPress();
    });

    const updatedInputs = renderer!.root.findAllByType(TextInput);
    expect(updatedInputs.find((input) => input.props.accessibilityLabel === 'Full name *')?.props.value).toBe('Maya Chen');
    expect(updatedInputs.find((input) => input.props.accessibilityLabel === 'Email *')?.props.value).toBe('maya@example.com');
    expect(renderer!.root.findAllByType(Text).some((node) => node.props.children === 'Email already exists.')).toBe(true);
  });
});
