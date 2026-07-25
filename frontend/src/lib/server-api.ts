import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { ApiEnvelope, LoginData, SessionUser } from './types';

const ACCESS_COOKIE = 'ceish_access_token';
const REFRESH_COOKIE = 'ceish_refresh_token';
const backendUrl = process.env.BACKEND_API_URL ?? 'http://localhost:3000/api/v1';

export async function backendFetch(path: string, init: RequestInit = {}) {
  return fetch(`${backendUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
    cache: 'no-store',
  });
}

export async function forwardResponse(response: Response) {
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') ?? 'application/json' },
  });
}

export function setSessionCookies(response: NextResponse, tokens: LoginData) {
  const secure = process.env.SESSION_COOKIE_SECURE === 'true';
  const options = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/' };
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...options, maxAge: 15 * 60 });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 });
}

export function clearSessionCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const response = await backendFetch('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as ApiEnvelope<SessionUser>;
  return payload.data;
}

export async function refreshSession(): Promise<LoginData | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const response = await backendFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as ApiEnvelope<LoginData>;
  return payload.data;
}
