import { NextResponse } from 'next/server';
import { backendFetch, forwardResponse, getAccessToken } from '@/lib/server-api';

export async function PUT(request: Request) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ message: 'Sesion no valida' }, { status: 401 });
  return forwardResponse(await backendFetch('/users/me/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: await request.text(),
  }));
}
