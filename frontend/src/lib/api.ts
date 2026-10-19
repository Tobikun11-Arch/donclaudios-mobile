import { API_BASE_URL } from './config';
import { tokenStore } from './token-store';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type ErrorPayload = {
  success?: boolean;
  code?: string;
  message?: string;
  details?: unknown;
};

let refreshing: Promise<boolean> | null = null;

async function toApiError(res: Response): Promise<ApiError> {
  let payload: ErrorPayload | undefined;
  try {
    payload = (await res.json()) as ErrorPayload;
  } catch {
    payload = undefined;
  }
  return new ApiError(
    res.status,
    payload?.code ?? 'REQUEST_FAILED',
    payload?.message ?? `Request failed (${res.status})`,
    payload?.details ?? payload
  );
}

async function refreshTokens(): Promise<boolean> {
  if (refreshing) {
    return refreshing;
  }

  refreshing = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokenStore.refresh })
      });

      if (!res.ok) {
        await tokenStore.clear();
        return false;
      }

      const data = (await res.json()) as {
        accessToken?: string;
        refreshToken?: string;
      };

      if (data.accessToken && data.refreshToken) {
        await tokenStore.set(data.accessToken, data.refreshToken);
        return true;
      }

      await tokenStore.clear();
      return false;
    } catch {
      await tokenStore.clear();
      return false;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  body?: unknown,
  retry = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  const access = tokenStore.access;
  if (access) {
    headers.Authorization = `Bearer ${access}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (res.status === 401 && retry && tokenStore.refresh) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return request<T>(method, path, body, false);
    }
  }

  if (!res.ok) {
    throw await toApiError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body)
};