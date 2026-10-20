import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { api, ApiError } from './api';

export type User = {
  id: string;
  type: 'customer' | 'cashier' | 'admin';
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  username?: string;
  profilePhoto?: string;
  businessName?: string;
  businessLogo?: string;
  storeAddress?: string;
  businessContactNumber?: string;
  operatingHours?: string;
  businessType?: string;
  closingTime?: string;
  advanceCloseMinutes?: number;
  defaultPrepMinutes?: number;
  isManuallyClosed?: boolean;
  manualCloseReason?: string;
};

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type SignUpParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
};

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (params: SignUpParams) => Promise<void>;
  verify: (phoneNumber: string, code: string) => Promise<void>;
  resendVerification: (phoneNumber: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get<{ user: User }>('/api/auth/me');
      setUser(data.user);
      setStatus('signedIn');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setStatus('signedOut');
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
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
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await api.post('/api/auth/login', { email, password });
    await refreshUser();
  }, [refreshUser]);

  const signUp = useCallback(async (params: SignUpParams) => {
    await api.post('/api/auth/register', params);
  }, []);

  const verify = useCallback(async (phoneNumber: string, code: string) => {
    await api.post('/api/auth/verify', { phoneNumber, code });
  }, []);

  const resendVerification = useCallback(async (phoneNumber: string) => {
    await api.post('/api/auth/resend-verification', { phoneNumber });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore
    }
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
      signOut,
      refreshUser
    }),
    [status, user, signIn, signUp, verify, resendVerification, signOut, refreshUser]
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