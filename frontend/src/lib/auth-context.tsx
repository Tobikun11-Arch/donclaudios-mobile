import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, ApiError } from './api';
import { tokenStore } from './token-store';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  isVerified: boolean;
  createdAt: string;
  type: 'user' | 'admin';
};

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type SignUpParams = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
};

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  verify: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    type: 'user' | 'admin';
  };
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      await tokenStore.load();

      if (!tokenStore.access) {
        if (!cancelled) setStatus('signedOut');
        return;
      }

      try {
        const data = await api.get<{ user: User }>('/api/auth/me');
        if (!cancelled) {
          setUser(data.user);
          setStatus('signedIn');
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setStatus('signedOut');
          await tokenStore.clear();
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get<{ user: User }>('/api/auth/me');
      setUser(data.user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setStatus('signedOut');
        await tokenStore.clear();
      }
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await api.post<LoginResponse>('/api/auth/login', { email, password });
    await tokenStore.set(data.accessToken, data.refreshToken);
    setStatus('signedIn');
    await refreshUser();
  }, [refreshUser]);

  const signUp = useCallback(async (params: SignUpParams) => {
    await api.post('/api/auth/register', params);
  }, []);

  const verify = useCallback(async (email: string, code: string) => {
    await api.post('/api/auth/verify', { email, code });
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    await api.post('/api/auth/resend-verification', { email });
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await api.post('/api/auth/forgot-password', { email });
  }, []);

  const verifyResetCode = useCallback(async (email: string, code: string) => {
    await api.post('/api/auth/verify-reset-code', { email, code });
  }, []);

  const resetPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      await api.post('/api/auth/reset-password', { email, code, newPassword });
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      if (tokenStore.refresh) {
        await api.post('/api/auth/logout', { refreshToken: tokenStore.refresh });
      }
    } catch {
      // ignore network/cleanup errors during sign out
    }
    await tokenStore.clear();
    setUser(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      signIn,
      signUp,
      verify,
      resendVerification,
      forgotPassword,
      verifyResetCode,
      resetPassword,
      signOut,
      refreshUser
    }),
    [
      status,
      user,
      signIn,
      signUp,
      verify,
      resendVerification,
      forgotPassword,
      verifyResetCode,
      resetPassword,
      signOut,
      refreshUser
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}