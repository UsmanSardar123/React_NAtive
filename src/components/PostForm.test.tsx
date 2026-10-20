import React from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import PostForm from './PostForm';
import { ThemeProvider } from '../theme/ThemeContext';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, writable: true });

jest.mock('react-native', () => {
  const mockReact = require('react');
  const mockHost = (name: string) => (props: Record<string, unknown>) =>
    mockReact.createElement(name, props, props.children);
  return {
    ActivityIndicator: mockHost('ActivityIndicator'),
    Pressable: mockHost('Pressable'),
    Text: mockHost('Text'),
    TextInput: mockHost('TextInput'),
    View: mockHost('View'),
    StyleSheet: { create: (styles: unknown) => styles },
  };
});

describe('PostForm', () => {
  it('keeps the selected values and prevents rapid duplicate submissions', async () => {
    let finishSubmit: (() => void) | undefined;
    const onSubmit = jest.fn(() => new Promise<void>((resolve) => {
      finishSubmit = resolve;
    }));
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <PostForm
            initialTitle="Existing title"
            initialBody="Existing body"
            submitLabel="Save Changes"
            onSubmit={onSubmit}
          />
        </ThemeProvider>,
      );
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    expect(inputs[0].props.value).toBe('Existing title');
    expect(inputs[1].props.value).toBe('Existing body');

    let pending: Promise<void>;
    act(() => {
      const submit = renderer!.root.findByType(Pressable).props.onPress as () => Promise<void>;
      pending = submit();
      submit();
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishSubmit?.();
      await pending!;
    });
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Existing title', body: 'Existing body' });
  });

  it('preserves the form values and shows an error when saving fails', async () => {
    const onSubmit = jest.fn().mockRejectedValue(new Error('Server unavailable'));
    let renderer: TestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = TestRenderer.create(
        <ThemeProvider>
          <PostForm
            initialTitle="Draft title"
            initialBody="Draft body"
            submitLabel="Save Changes"
            onSubmit={onSubmit}
          />
        </ThemeProvider>,
      );
    });

    await act(async () => {
      await renderer!.root.findByType(Pressable).props.onPress();
    });

    const inputs = renderer!.root.findAllByType(TextInput);
    expect(inputs[0].props.value).toBe('Draft title');
    expect(inputs[1].props.value).toBe('Draft body');
    expect(renderer!.root.findAllByType(Text).some((node) => node.props.children === 'Server unavailable')).toBe(true);
  });
});
