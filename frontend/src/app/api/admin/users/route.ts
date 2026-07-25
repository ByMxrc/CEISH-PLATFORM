import { NextResponse } from 'next/server';
import { backendFetch, forwardResponse, getAccessToken } from '@/lib/server-api';

export async function GET() {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ message: 'Sesión no válida' }, { status: 401 });

  return forwardResponse(await backendFetch('/admin/users?accountStatus=PENDING_APPROVAL&userType=INVESTIGATOR', {
    headers: { Authorization: `Bearer ${token}` },
  }));
}
