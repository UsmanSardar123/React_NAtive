import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type ToastType = 'success' | 'error';
type ToastState = { message: string; type: ToastType } | null;

type ToastProps = {
  message: string;
  type: ToastType;
  visible: boolean;
};

export function Toast({ message, type, visible }: ToastProps) {
  const { colors, spacing, radius } = useTheme();
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [animation, visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: type === 'success' ? colors.success : colors.danger,
          borderRadius: radius.md,
          opacity: animation,
          padding: spacing.md,
          transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
        },
      ]}
    >
      <Text style={[styles.text, { color: type === 'success' ? colors.success : colors.danger }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const [visible, setVisible] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  function showToast(message: string, type: ToastType) {
    if (timeout.current) clearTimeout(timeout.current);
    setToast({ message, type });
    setVisible(true);
    timeout.current = setTimeout(() => setVisible(false), 2000);
  }

  return {
    showToast,
    toast: toast ? { ...toast, visible } : null,
  };
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderWidth: 1,
    elevation: 4,
    left: 16,
    position: 'absolute',
    right: 16,
    top: 12,
    zIndex: 10,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
