// src/server/queries/auth.ts
import { query } from '../../lib/database';

/**
 * Verifica credenciales y devuelve el usuario sin la contraseña.
 * Retorna null si el email no existe o la contraseña no coincide.
 *
 * Reutiliza el mismo tipo UserRow que ya existe en users.ts.
 * La query incluye password en el WHERE pero nunca lo devuelve.
 *
 * NOTE: comparación en texto plano — solo para el prototipo.
 */
export async function loginUser(email: string, password: string) {
  const rows = await query<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>(
    `SELECT u.id, u.name, u.email, r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
      WHERE u.email = $1
        AND u.password = $2
      LIMIT 1`,
    [email, password],
  );

  if (!rows[0]) return null;

  const roleMap: Record<string, string> = {
    teacher: 'evaluator',
    student: 'student',
    admin: 'admin',
  };

  return { ...rows[0], role: roleMap[rows[0].role] ?? rows[0].role };
}