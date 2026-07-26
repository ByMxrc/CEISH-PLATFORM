import type { UserType } from './types';

export function dashboardPath(userType: UserType) {
  if (userType === 'ADMIN') return '/admin';
  if (userType === 'CEISH_MEMBER') return '/ceish';
  return '/investigador';
}
