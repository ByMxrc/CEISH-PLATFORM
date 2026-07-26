import { redirect } from 'next/navigation';
import { getCurrentUser } from './server-api';
import { dashboardPath } from './routes';
import type { SessionUser, UserType } from './types';

export async function requireCurrentUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(role: UserType): Promise<SessionUser> {
  const user = await requireCurrentUser();
  if (user.userType !== role) redirect(dashboardPath(user.userType));
  return user;
}
