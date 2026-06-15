/**
 * Tipos para el módulo de autenticación
 * Define las interfaces y tipos utilizados en el flujo de login
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: 'student' | 'teacher' | 'reviewer' | 'admin';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export type LoginResponse = {
  success: boolean;
  message: string;
  user?: AuthUser;
};
