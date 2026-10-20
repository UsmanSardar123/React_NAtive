import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PORT = 5000;
const REQUEST_TIMEOUT_MS = 10000;
const androidHost = (() => {
  const host = Constants.expoConfig?.hostUri?.split(':')[0];

  return host && host !== 'localhost' && host !== '127.0.0.1'
    ? host
    : '10.0.2.2';
})();
const BASE_URL = Platform.OS === 'android'
  ? `http://${androidHost}:${PORT}`
  : `http://localhost:${PORT}`;

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = BASE_URL + path;
  let res: Response;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    res = await fetch(url, {
      ...options,
      signal: options.signal ?? controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`);
    }
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to reach ${url}: ${reason}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    let message = `Request to ${url} failed with HTTP ${res.status}.`;
    try {
      const payload: unknown = await res.json();
      if (
        typeof payload === 'object'
        && payload !== null
        && 'message' in payload
        && typeof payload.message === 'string'
      ) {
        message = `${payload.message} (HTTP ${res.status})`;
      }
    } catch {
      // Keep the status and URL when the server does not return JSON.
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return null as T;
  }

  return res.json();

}
