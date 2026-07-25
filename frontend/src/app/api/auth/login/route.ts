import { NextResponse } from 'next/server';
import { backendFetch, forwardResponse, setSessionCookies } from '@/lib/server-api';
import type { ApiEnvelope, LoginData } from '@/lib/types';

export async function POST(request: Request) {
  const response = await backendFetch('/auth/login', {
    method: 'POST',
    body: await request.text(),
  });
  if (!response.ok) return forwardResponse(response);

  const payload = (await response.json()) as ApiEnvelope<LoginData>;
  const result = NextResponse.json({ success: true, data: { user: payload.data.user } });
  setSessionCookies(result, payload.data);
  return result;
}
