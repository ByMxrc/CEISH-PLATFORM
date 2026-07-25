import { NextResponse } from 'next/server';
import { backendFetch, forwardResponse, getAccessToken } from '@/lib/server-api';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ message: 'Sesión no válida' }, { status: 401 });
  const { id } = await params;
  return forwardResponse(await backendFetch(`/admin/users/${id}/reject`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: await request.text(),
  }));
}
