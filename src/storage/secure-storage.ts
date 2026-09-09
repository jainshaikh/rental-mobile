import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Centralized secure storage keys — access token is intentionally never persisted
// here (kept in memory only, see src/api/client.ts) so it disappears on app kill.
const REFRESH_TOKEN_KEY = 'auth.refreshToken';
const AUTH_USER_KEY = 'auth.user';

// expo-secure-store has NO web implementation (there's no OS keychain in a browser —
// ExpoSecureStore.web.js literally exports {}), so calling it on web throws
// "... is not a function". This app's real target is native (Expo Go / dev client on
// Android/iOS) per the implementation reference — `expo start --web` is dev-only
// convenience for eyeballing UI. localStorage here is NOT secure storage; it only
// exists so the web preview doesn't hard-crash on every auth call.
const isWeb = Platform.OS === 'web';

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string): Promise<void> {
  await setItem(REFRESH_TOKEN_KEY, token);
}

export async function clearRefreshToken(): Promise<void> {
  await deleteItem(REFRESH_TOKEN_KEY);
}

export async function getStoredAuthUser<T>(): Promise<T | null> {
  const raw = await getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setStoredAuthUser(user: unknown): Promise<void> {
  await setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export async function clearStoredAuthUser(): Promise<void> {
  await deleteItem(AUTH_USER_KEY);
}

export async function clearAllAuthStorage(): Promise<void> {
  await Promise.all([clearRefreshToken(), clearStoredAuthUser()]);
}
