import React from 'react';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import type { LoginResponse, LoginCredentials } from '../types/auth';

/**
 * Página Login
 * Página principal de autenticación de la plataforma CEISH-Uleam
 * Integra layout y formulario de login
 */
const Login: React.FC = () => {
  const handleLoginSubmit = async (
    credentials: LoginCredentials
  ): Promise<LoginResponse> => {
    // Aquí se conectaría con el backend real
    // Por ahora es una simulación local
    return new Promise((resolve) => {
      setTimeout(() => {
        if (credentials.username === 'demo' && credentials.password === 'password') {
          resolve({
            success: true,
            message: 'Autenticación exitosa',
            user: {
              id: '1',
              username: credentials.username,
              email: `${credentials.username}@live.uleam.edu.ec`,
              role: 'student',
            },
          });
        } else {
          resolve({
            success: false,
            message:
              'Usuario o contraseña incorrectos',
          });
        }
      }, 1000);
    });
  };

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleLoginSubmit} />
    </AuthLayout>
  );
};

export default Login;
