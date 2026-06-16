// Consultas SQL del dominio de entregas (lado servidor).
import { query } from '../../lib/database';

export interface SubmissionRow {
  id: string;
  student_id: string;
  student_name: string;
  document_name: string;
  document_path: string | null;
  comment: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  grade: number | null;
  final_comment: string | null;
}

const BASE_SELECT = `
  SELECT s.id, s.student_id, u.name AS student_name,
         s.document_name, s.document_path, s.comment, s.status,
         s.submitted_at, s.reviewed_at, s.grade, s.final_comment
    FROM submissions s
    JOIN users u ON u.id = s.student_id`;

export async function listSubmissions(): Promise<SubmissionRow[]> {
  return query<SubmissionRow>(`${BASE_SELECT} ORDER BY s.submitted_at DESC`);
}

export async function getSubmissionByStudent(studentId: string): Promise<SubmissionRow | null> {
  const rows = await query<SubmissionRow>(
    `${BASE_SELECT} WHERE s.student_id = $1 ORDER BY s.submitted_at DESC LIMIT 1`,
    [studentId],
  );
  return rows[0] ?? null;
}

export async function getSubmissionById(id: string): Promise<SubmissionRow | null> {
  const rows = await query<SubmissionRow>(`${BASE_SELECT} WHERE s.id = $1`, [id]);
  return rows[0] ?? null;
}

export interface CreateSubmissionInput {
  studentId: string;
  documentName: string;
  documentPath: string | null;
  comment: string;
}

export async function createSubmission(input: CreateSubmissionInput): Promise<SubmissionRow> {
  const rows = await query<{ id: string }>(
    `INSERT INTO submissions (student_id, document_name, document_path, comment, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING id`,
    [input.studentId, input.documentName, input.documentPath, input.comment],
  );
  return (await getSubmissionById(rows[0].id))!;
}

export async function updateSubmission(
  id: string,
  patch: { documentName?: string; comment?: string; documentPath?: string },
): Promise<SubmissionRow | null> {
  await query(
    `UPDATE submissions
        SET document_name = COALESCE($2, document_name),
            comment       = COALESCE($3, comment),
            document_path = COALESCE($4, document_path)
      WHERE id = $1`,
    [id, patch.documentName ?? null, patch.comment ?? null, patch.documentPath ?? null],
  );
  return getSubmissionById(id);
}

/** Devuelve solo la clave del objeto almacenado para una entrega. */
export async function getDocumentPath(id: string): Promise<string | null> {
  const rows = await query<{ document_path: string | null }>(
    `SELECT document_path FROM submissions WHERE id = $1`,
    [id],
  );
  return rows[0]?.document_path ?? null;
}

export async function deleteSubmission(id: string): Promise<void> {
  await query(`DELETE FROM submissions WHERE id = $1`, [id]);
}
