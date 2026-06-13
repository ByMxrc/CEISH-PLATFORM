import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { MOCK_USERS } from '../../shared/services/platformService';
import type { User } from '../../shared/types/platform.types';
import './login.css';

const ROLE_LABEL = { admin: 'Administrador', evaluator: 'Profesor evaluador', student: 'Estudiante' };
const ROLE_ORDER = ['admin', 'evaluator', 'student'] as const;

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  evaluator: '/evaluador',
  student: '/estudiante',
};

export function LoginPage() {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleSelect = (user: User) => {
    setUser(user);
    navigate(ROLE_HOME[user.role], { replace: true });
  };

  const grouped = ROLE_ORDER.map((role) => ({
    role,
    users: MOCK_USERS.filter((u) => u.role === role),
  }));

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#2563eb" />
            <path d="M8 11h16M8 16h16M8 21h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <h1 className="login-title">CEISH Platform</h1>
            <p className="login-subtitle">Sistema de evaluación documental</p>
          </div>
        </div>

        <p className="login-prompt">Selecciona tu usuario para continuar</p>

        <div className="login-groups">
          {grouped.map(({ role, users }) => (
            <div key={role} className="login-group">
              <h2 className="login-group__label">{ROLE_LABEL[role]}</h2>
              <div className="login-group__users">
                {users.map((user) => (
                  <button
                    key={user.id}
                    className={`login-user-btn login-user-btn--${role}`}
                    onClick={() => handleSelect(user)}
                  >
                    <span className="login-user-btn__avatar">
                      {user.name.charAt(0)}
                    </span>
                    <div className="login-user-btn__info">
                      <span className="login-user-btn__name">{user.name}</span>
                      <span className="login-user-btn__email">{user.email}</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
