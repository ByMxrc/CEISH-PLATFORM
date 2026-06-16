// Consultas SQL del dominio de revisiones (lado servidor).
// Una revisión se devuelve con sus etapas, criterios y anotaciones anidados.
import { query } from '../../lib/database';

export interface AnnotationRow {
  id: string;
  page_number: number;
  x: number;
  y: number;
  width: number;
  height: number;
  comment: string;
}

export interface CriterionRow {
  id: string;
  criterion: string;
  status: string;
  comment: string;
  annotations: AnnotationRow[];
}

export interface StageRow {
  id: string;
  stage_number: number;
  status: string;
  completed_at: string | null;
  criteria: CriterionRow[];
}

export interface ReviewRow {
  id: string;
  submission_id: string;
  reviewer_id: string;
  reviewer_name: string;
  comment: string;
  grade: number | null;
  status: string;
  created_at: string;
  stages: StageRow[];
}

interface FlatReview {
  id: string;
  submission_id: string;
  reviewer_id: string;
  reviewer_name: string;
  comment: string;
  grade: number | null;
  status: string;
  created_at: string;
}

/** Devuelve la revisión de una entrega con todo el árbol anidado, o null. */
export async function getReviewBySubmission(submissionId: string): Promise<ReviewRow | null> {
  const reviews = await query<FlatReview>(
    `SELECT rv.id, rv.submission_id, rv.reviewer_id, u.name AS reviewer_name,
            rv.comment, rv.grade, rv.status, rv.created_at
       FROM reviews rv
       JOIN users u ON u.id = rv.reviewer_id
      WHERE rv.submission_id = $1`,
    [submissionId],
  );
  const review = reviews[0];
  if (!review) return null;

  const stages = await query<Omit<StageRow, 'criteria'>>(
    `SELECT id, stage_number, status, completed_at
       FROM review_stages
      WHERE review_id = $1
      ORDER BY stage_number`,
    [review.id],
  );

  const stageIds = stages.map((s) => s.id);
  const criteria = stageIds.length
    ? await query<CriterionRow & { stage_id: string }>(
        `SELECT id, stage_id, criterion, status, comment
           FROM criteria_evaluations
          WHERE stage_id = ANY($1)
          ORDER BY id`,
        [stageIds],
      )
    : [];

  const criterionIds = criteria.map((c) => c.id);
  const annotations = criterionIds.length
    ? await query<AnnotationRow & { criteria_evaluation_id: string }>(
        `SELECT id, criteria_evaluation_id, page_number, x, y, width, height, comment
           FROM annotations
          WHERE criteria_evaluation_id = ANY($1)`,
        [criterionIds],
      )
    : [];

  // Ensamblar el árbol (construyendo objetos explícitos, sin bindings descartados)
  return {
    ...review,
    stages: stages.map((stage) => ({
      ...stage,
      criteria: criteria
        .filter((c) => c.stage_id === stage.id)
        .map((c): CriterionRow => ({
          id: c.id,
          criterion: c.criterion,
          status: c.status,
          comment: c.comment,
          annotations: annotations
            .filter((a) => a.criteria_evaluation_id === c.id)
            .map((a): AnnotationRow => ({
              id: a.id,
              page_number: a.page_number,
              x: a.x,
              y: a.y,
              width: a.width,
              height: a.height,
              comment: a.comment,
            })),
        })),
    })),
  };
}
