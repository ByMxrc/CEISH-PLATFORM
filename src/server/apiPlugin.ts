// ============================================================================
// Plugin de Vite que expone un pequeño conjunto de rutas /api/* respaldadas
// por PostgreSQL. Corre dentro del proceso Node del dev server de Vite — NO
// es un proyecto backend separado ni un framework (Express/Nest); es solo el
// punto donde el frontend (navegador) obtiene datos sin hablar TCP con la BD.
// ============================================================================

import type { Plugin, Connect } from 'vite';
import type { ServerResponse } from 'node:http';

import { listUsers, listUsersByRole, getUserById } from './queries/users';
import { listSubmissions, getSubmissionByStudent, getSubmissionById } from './queries/submissions';
import { listAssignments, listAssignmentsByTeacher } from './queries/assignments';
import { getReviewBySubmission } from './queries/reviews';

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

/** Resuelve una petición /api/* y devuelve true si la manejó. */
async function handle(req: Connect.IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url ?? '', 'http://localhost');
  const path = url.pathname;
  if (!path.startsWith('/api/')) return false;

  // GET /api/users            -> todos (opcional ?role=student|teacher|admin)
  // GET /api/users/:id        -> uno
  if (path === '/api/users') {
    const role = url.searchParams.get('role');
    sendJson(res, 200, role ? await listUsersByRole(role) : await listUsers());
    return true;
  }
  const userMatch = path.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch) {
    const user = await getUserById(userMatch[1]);
    sendJson(res, user ? 200 : 404, user ?? { error: 'Usuario no encontrado' });
    return true;
  }

  // GET /api/submissions               -> todas
  // GET /api/submissions?studentId=..  -> la del estudiante
  // GET /api/submissions/:id           -> una
  if (path === '/api/submissions') {
    const studentId = url.searchParams.get('studentId');
    sendJson(res, 200, studentId ? await getSubmissionByStudent(studentId) : await listSubmissions());
    return true;
  }
  const subMatch = path.match(/^\/api\/submissions\/([^/]+)$/);
  if (subMatch) {
    const sub = await getSubmissionById(subMatch[1]);
    sendJson(res, sub ? 200 : 404, sub ?? { error: 'Entrega no encontrada' });
    return true;
  }

  // GET /api/assignments                 -> todas
  // GET /api/assignments?teacherId=..    -> las del profesor
  if (path === '/api/assignments') {
    const teacherId = url.searchParams.get('teacherId');
    sendJson(res, 200, teacherId ? await listAssignmentsByTeacher(teacherId) : await listAssignments());
    return true;
  }

  // GET /api/reviews/:submissionId  -> revisión con etapas/criterios/anotaciones
  const reviewMatch = path.match(/^\/api\/reviews\/([^/]+)$/);
  if (reviewMatch) {
    const review = await getReviewBySubmission(reviewMatch[1]);
    sendJson(res, review ? 200 : 404, review ?? { error: 'Revisión no encontrada' });
    return true;
  }

  sendJson(res, 404, { error: 'Ruta de API no encontrada' });
  return true;
}

export function apiPlugin(): Plugin {
  return {
    name: 'ceish-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();
        try {
          await handle(req, res);
        } catch (err) {
          console.error('[api] Error procesando', req.url, err);
          sendJson(res, 500, { error: 'Error interno del servidor' });
        }
      });
    },
  };
}
