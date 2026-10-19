import { Platform } from 'react-native';

const PORT = 5000;
const BASE_URL = Platform.OS === 'android'
  ? `http://10.0.2.2:${PORT}`
  : `http://localhost:${PORT}`;

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}
