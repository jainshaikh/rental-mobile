import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { authApi, type LoginPayload, type RegisterPayload } from '../api/auth.api';
import { usersApi } from '../api/users.api';
import { refreshAccessToken, setAccessToken, setOnSessionExpired } from '../api/client';
import { clearAllAuthStorage, getRefreshToken, setRefreshToken } from '../storage/secure-storage';
import type { AuthUser, User } from '../types/api.types';

interface AuthContextValue {
  user: AuthUser | User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (data: LoginPayload) => Promise<AuthUser>;
  register: (data: RegisterPayload) => Promise<{ message: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const queryClient = useQueryClient();

  const clearSession = useCallback(async () => {
    setAccessToken(null);
    await clearAllAuthStorage();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setOnSessionExpired(() => {
      clearSession();
    });

    (async () => {
      try {
        const storedRefreshToken = await getRefreshToken();
        if (!storedRefreshToken) {
          setIsBootstrapping(false);
          return;
        }

        const newAccessToken = await refreshAccessToken();
        if (!newAccessToken) {
          await clearAllAuthStorage();
          setIsBootstrapping(false);
          return;
        }

        const me = await usersApi.getMe();
        setUser(me);
      } catch {
        await clearAllAuthStorage();
        setAccessToken(null);
      } finally {
        setIsBootstrapping(false);
      }
    })();

    return () => setOnSessionExpired(null);
  }, [clearSession]);

  const login = useCallback(async (data: LoginPayload) => {
    const result = await authApi.login(data);
    setAccessToken(result.accessToken);
    if (result.refreshToken) {
      await setRefreshToken(result.refreshToken);
    }
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    const result = await authApi.register(data);
    return { message: result.message };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Best-effort — clear local session regardless of network/server outcome.
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [user, isBootstrapping, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
