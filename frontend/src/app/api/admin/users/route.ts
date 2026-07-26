import { NextResponse } from 'next/server';
import { backendFetch, forwardResponse, getAccessToken } from '@/lib/server-api';

export async function GET(request: Request) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ message: 'Sesión no válida' }, { status: 401 });

  const input = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  for (const key of ['search', 'accountStatus', 'userType', 'page', 'limit']) {
    const value = input.get(key);
    if (value) query.set(key, value);
  }
  const suffix = query.size ? `?${query.toString()}` : '';
  return forwardResponse(await backendFetch(`/admin/users${suffix}`, {
    headers: { Authorization: `Bearer ${token}` },
  }));
}
