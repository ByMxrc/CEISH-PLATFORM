import React, { useState } from 'react';
import { colors, typography, spacing } from '../../constants/colors';
import type { LoginCredentials, LoginResponse } from '../../types/auth';
import Input from '../common/Input';
import Button from '../common/Button';
import Card from '../common/Card';

interface LoginFormProps {
  onSubmit?: (credentials: LoginCredentials) => Promise<LoginResponse>;
}

/**
 * LoginForm Mejorado
 * Formulario de autenticación sofisticado con animaciones, mejor tipografía y diseño moderno
 */
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }

    if (!credentials.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (credentials.password.length < 1) {
      newErrors.password = 'Contraseña inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }

    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError(null);
    setSuccessMessage(null);

    try {
      if (onSubmit) {
        const response = await onSubmit(credentials);

        if (response.success) {
          setSuccessMessage(
            response.message || 'Inicio de sesión exitoso. Redirigiendo...'
          );
          setTimeout(() => {
            console.log('Redireccionar a dashboard');
          }, 1500);
        } else {
          setGeneralError(
            response.message || 'Error al iniciar sesión. Intenta de nuevo.'
          );
        }
      } else if (
        credentials.username === 'demo' &&
        credentials.password === 'password'
      ) {
        setSuccessMessage('Inicio de sesión exitoso');
        console.log('Login exitoso con:', credentials);
      } else {
        setGeneralError('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      setGeneralError('Error de conexión. Por favor intenta de nuevo.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .login-form__error-message {
          animation: shake 0.5s ease-in-out;
        }

        .login-form__success-message {
          animation: fadeInDown 0.4s ease-out;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <Card variant="elevated" padding="md">
        {/* Header */}
        <div style={{ marginBottom: spacing.xl }}>
          <h1
            style={{
              textAlign: 'center',
              margin: 0,
              marginBottom: spacing.sm,
              fontSize: '1.95rem',
              fontWeight: 700,
              color: colors.surface.dark,
              fontFamily: typography.fontFamily.display,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Acceso a Plataforma
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: typography.fontSize.sm,
              color: colors.gray[600],
              fontFamily: typography.fontFamily.body,
              fontWeight: 500,
              lineHeight: 1.7,
              textAlign: 'center',
            }}
          >
            Inicia sesión para acceder a la plataforma
          </p>
        </div>

        {/* Línea decorativa */}
        <div
          style={{
            height: '3px',
            background: `linear-gradient(90deg, ${colors.primary[500]} 0%, ${colors.success[500]} 100%)`,
            borderRadius: '2px',
            marginBottom: spacing['2xl'],
          }}
        />

        {/* Mensajes */}
        {generalError && (
          <div
            className="login-form__error-message"
            style={{
              marginBottom: spacing.lg,
              padding: spacing.md,
              borderRadius: '0.75rem',
              backgroundColor: '#FEE2E2',
              border: `1px solid ${colors.state.error}`,
              display: 'flex',
              gap: spacing.sm,
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>⚠️</span>
            <p
              style={{
                margin: 0,
                fontSize: typography.fontSize.sm,
                color: '#991B1B',
                fontFamily: typography.fontFamily.body,
                fontWeight: 500,
              }}
            >
              {generalError}
            </p>
          </div>
        )}

        {successMessage && (
          <div
            className="login-form__success-message"
            style={{
              marginBottom: spacing.lg,
              padding: spacing.md,
              borderRadius: '0.75rem',
              backgroundColor: '#DCFCE7',
              border: `1px solid ${colors.success[500]}`,
              display: 'flex',
              gap: spacing.sm,
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>✓</span>
            <p
              style={{
                margin: 0,
                fontSize: typography.fontSize.sm,
                color: '#166534',
                fontFamily: typography.fontFamily.body,
                fontWeight: 500,
              }}
            >
              {successMessage}
            </p>
          </div>
        )}

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.md,
            marginBottom: spacing.xl,
          }}
        >
          {/* Usuario */}
          <div>
            <Input
              label="Usuario"
              type="text"
              name="username"
              placeholder="ej. abc123456"
              value={credentials.username}
              onChange={(e) => handleChange('username', e.target.value)}
              error={errors.username}
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          {/* Contraseña */}
          <div>
            <Input
              label="Contraseña"
              type="password"
              name="password"
              placeholder="••••••••"
              value={credentials.password}
              onChange={(e) => handleChange('password', e.target.value)}
              error={errors.password}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {/* Botón */}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
            style={{
              marginTop: spacing.sm,
              fontWeight: 600,
              letterSpacing: '0.8px',
              fontSize: '1rem',
              textTransform: 'uppercase',
            }}
          >
            {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
          </Button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.md,
            marginBottom: spacing['2xl'],
          }}
        >
          <div
            style={{
              flex: 1,
              height: '1px',
              backgroundColor: colors.border,
            }}
          />
          <span
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.gray[500],
              fontWeight: 500,
            }}
          >
            O
          </span>
          <div
            style={{
              flex: 1,
              height: '1px',
              backgroundColor: colors.border,
            }}
          />
        </div>

        {/* Links de ayuda */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: spacing.md,
            marginBottom: spacing['2xl'],
          }}
        >
          <a
            href="#forgot"
            style={{
              padding: spacing.md,
              textAlign: 'center',
              color: colors.primary[500],
              textDecoration: 'none',
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.sm,
              fontWeight: 500,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary[50];
              e.currentTarget.style.borderColor = colors.primary[500];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            Recuperar acceso
          </a>
          <a
            href="#support"
            style={{
              padding: spacing.md,
              textAlign: 'center',
              color: colors.gray[700],
              textDecoration: 'none',
              fontFamily: typography.fontFamily.body,
              fontSize: typography.fontSize.sm,
              fontWeight: 500,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.gray[100];
              e.currentTarget.style.borderColor = colors.gray[300];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            Centro de ayuda
          </a>
        </div>

        {/* Footer info */}
        <div
          style={{
            paddingTop: spacing.lg,
            borderTop: `1px solid ${colors.border}`,
            fontSize: typography.fontSize.xs,
            color: colors.gray[500],
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: 0 }}>
            ¿Problemas para acceder?{' '}
            <a
              href="#"
              style={{
                color: colors.primary[500],
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Contacta soporte
            </a>
          </p>
        </div>
      </Card>
    </>
  );
};

export default LoginForm;
