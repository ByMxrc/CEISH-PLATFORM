import { NextResponse } from 'next/server';
import { backendFetch, forwardResponse, getRefreshToken, setSessionCookies } from '@/lib/server-api';
import type { ApiEnvelope, LoginData } from '@/lib/types';

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return NextResponse.json({ message: 'No existe una sesión para renovar' }, { status: 401 });

  const response = await backendFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) return forwardResponse(response);

  const payload = (await response.json()) as ApiEnvelope<LoginData>;
  const result = NextResponse.json({ success: true, data: { user: payload.data.user } });
  setSessionCookies(result, payload.data);
  return result;
}
