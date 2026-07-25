export type UserType = 'INVESTIGATOR' | 'CEISH_MEMBER' | 'ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  accountStatus: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
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
