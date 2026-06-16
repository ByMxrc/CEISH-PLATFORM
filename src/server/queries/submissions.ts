// Consultas SQL del dominio de entregas (lado servidor).
import { query } from '../../lib/database';

export interface SubmissionRow {
  id: string;
  student_id: string;
  student_name: string;
  document_name: string;
  document_url: string;
  comment: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  grade: number | null;
}

const BASE_SELECT = `
  SELECT s.id, s.student_id, u.name AS student_name,
         s.document_name, s.document_url, s.comment, s.status,
         s.submitted_at, s.reviewed_at, s.grade
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
