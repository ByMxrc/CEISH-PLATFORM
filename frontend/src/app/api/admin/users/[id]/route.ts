import { NextResponse } from 'next/server';
import { backendFetch, forwardResponse, getAccessToken } from '@/lib/server-api';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ message: 'Sesion no valida' }, { status: 401 });
  const { id } = await params;
  return forwardResponse(await backendFetch(`/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }));
}
