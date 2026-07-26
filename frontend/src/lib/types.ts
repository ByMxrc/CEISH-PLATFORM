export type UserType = 'INVESTIGATOR' | 'CEISH_MEMBER' | 'ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  accountStatus: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  createdAt?: string;
  investigatorProfile?: {
    investigatorType: 'INTERNAL' | 'EXTERNAL';
    identificationNumber: string | null;
    identificationVerifiedAt: string | null;
    institution: string | null;
    department: string | null;
    phone: string | null;
  } | null;
  ceishMemberProfile?: {
    memberType: 'INTERNAL' | 'EXTERNAL';
    specialization: string | null;
    institution: string | null;
    phone: string | null;
  } | null;
}

export interface AccountHistoryEntry {
  eventType: 'USER_REGISTERED' | 'USER_APPROVED' | 'USER_REJECTED' | 'ADMIN_ACTION';
  previousStatus: string | null;
  newStatus: string | null;
  reason: string | null;
  description: string | null;
  occurredAt: string;
}

export interface UserDetail extends SessionUser {
  accountHistory: AccountHistoryEntry[];
}

export interface UserListData {
  users: SessionUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

export interface ApiError {
  message?: string | string[];
  error?: string;
}
