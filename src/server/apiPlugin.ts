// ============================================================================
// Plugin de Vite que expone un pequeño conjunto de rutas /api/* respaldadas
// por PostgreSQL. Corre dentro del proceso Node del dev server de Vite — NO
// es un proyecto backend separado ni un framework (Express/Nest); es solo el
// punto donde el frontend (navegador) obtiene datos sin hablar TCP con la BD.
// ============================================================================

import type { Plugin, Connect } from 'vite';
import type { ServerResponse } from 'node:http';

import { listUsers, listUsersByRole, getUserById } from './queries/users';
import {
  listSubmissions, getSubmissionByStudent, getSubmissionById,
  createSubmission, updateSubmission, deleteSubmission,
} from './queries/submissions';
import {
  listAssignments, listAssignmentsByTeacher, createAssignment, deleteAssignment,
} from './queries/assignments';
import { getReviewBySubmission, getOrCreateReview, saveReview } from './queries/reviews';
import type { SaveReviewInput } from './queries/reviews';

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

/** Lee y parsea el cuerpo JSON de la petición. */
function readJsonBody(req: Connect.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

/** Resuelve una petición /api/* y devuelve true si la manejó. */
async function handle(req: Connect.IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url ?? '', 'http://localhost');
  const path = url.pathname;
  const method = (req.method ?? 'GET').toUpperCase();
  if (!path.startsWith('/api/')) return false;

  // ── Users ──────────────────────────────────────────────────────────────
  if (path === '/api/users' && method === 'GET') {
    const role = url.searchParams.get('role');
    sendJson(res, 200, role ? await listUsersByRole(role) : await listUsers());
    return true;
  }
  const userMatch = path.match(/^\/api\/users\/([^/]+)$/);
  if (userMatch && method === 'GET') {
    const user = await getUserById(userMatch[1]);
    sendJson(res, user ? 200 : 404, user ?? { error: 'Usuario no encontrado' });
    return true;
  }

  // ── Submissions ────────────────────────────────────────────────────────
  if (path === '/api/submissions' && method === 'GET') {
    const studentId = url.searchParams.get('studentId');
    sendJson(res, 200, studentId ? await getSubmissionByStudent(studentId) : await listSubmissions());
    return true;
  }
  if (path === '/api/submissions' && method === 'POST') {
    const b = await readJsonBody(req);
    const created = await createSubmission({
      studentId: String(b.studentId),
      documentName: String(b.documentName),
      documentUrl: String(b.documentUrl ?? `/uploads/${b.documentName}`),
      comment: String(b.comment ?? ''),
    });
    sendJson(res, 201, created);
    return true;
  }
  const subMatch = path.match(/^\/api\/submissions\/([^/]+)$/);
  if (subMatch && method === 'GET') {
    const sub = await getSubmissionById(subMatch[1]);
    sendJson(res, sub ? 200 : 404, sub ?? { error: 'Entrega no encontrada' });
    return true;
  }
  if (subMatch && method === 'PATCH') {
    const b = await readJsonBody(req);
    const updated = await updateSubmission(subMatch[1], {
      documentName: b.documentName as string | undefined,
      comment: b.comment as string | undefined,
    });
    sendJson(res, updated ? 200 : 404, updated ?? { error: 'Entrega no encontrada' });
    return true;
  }
  if (subMatch && method === 'DELETE') {
    await deleteSubmission(subMatch[1]);
    sendJson(res, 200, { ok: true });
    return true;
  }

  // ── Assignments ──────────────────────────────────────────────────────────
  if (path === '/api/assignments' && method === 'GET') {
    const teacherId = url.searchParams.get('teacherId');
    sendJson(res, 200, teacherId ? await listAssignmentsByTeacher(teacherId) : await listAssignments());
    return true;
  }
  if (path === '/api/assignments' && method === 'POST') {
    const b = await readJsonBody(req);
    const created = await createAssignment(String(b.teacherId), String(b.studentId));
    sendJson(res, 201, created);
    return true;
  }
  const assignMatch = path.match(/^\/api\/assignments\/([^/]+)$/);
  if (assignMatch && method === 'DELETE') {
    await deleteAssignment(assignMatch[1]);
    sendJson(res, 200, { ok: true });
    return true;
  }

  // ── Reviews ──────────────────────────────────────────────────────────────
  // GET  /api/reviews/:submissionId  -> leer (o null)
  // POST /api/reviews                -> obtener o crear  { submissionId, evaluatorId }
  // PUT  /api/reviews/:reviewId      -> guardar el árbol completo
  if (path === '/api/reviews' && method === 'POST') {
    const b = await readJsonBody(req);
    const review = await getOrCreateReview(String(b.submissionId), String(b.evaluatorId));
    sendJson(res, 200, review);
    return true;
  }
  const reviewMatch = path.match(/^\/api\/reviews\/([^/]+)$/);
  if (reviewMatch && method === 'GET') {
    const review = await getReviewBySubmission(reviewMatch[1]);
    sendJson(res, review ? 200 : 404, review ?? { error: 'Revisión no encontrada' });
    return true;
  }
  if (reviewMatch && method === 'PUT') {
    const b = await readJsonBody(req);
    await saveReview(b as unknown as SaveReviewInput);
    sendJson(res, 200, { ok: true });
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
