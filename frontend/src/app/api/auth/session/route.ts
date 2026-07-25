import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server-api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: 'Sesión no válida' }, { status: 401 });
  return NextResponse.json({ success: true, data: user });
}
