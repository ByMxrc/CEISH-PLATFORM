import type { User, StudentSubmission, Review, Assignment, ReviewStage } from '../types/platform.types';

// ─── Static reference data ───────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  { id: 'u-0', name: 'Admin CEISH', email: 'admin@ceish.edu', role: 'admin' },
  { id: 'u-1', name: 'Prof. García', email: 'garcia@ceish.edu', role: 'evaluator' },
  { id: 'u-2', name: 'Prof. Martínez', email: 'martinez@ceish.edu', role: 'evaluator' },
  { id: 'u-3', name: 'Juan Pérez', email: 'juan@ceish.edu', role: 'student' },
  { id: 'u-4', name: 'María López', email: 'maria@ceish.edu', role: 'student' },
  { id: 'u-5', name: 'Carlos Ruiz', email: 'carlos@ceish.edu', role: 'student' },
];

// ─── Mutable in-memory state ──────────────────────────────────────────────────

const submissions: StudentSubmission[] = [
  {
    id: 'sub-1',
    studentId: 'u-3',
    documentName: 'Proyecto_Final_Juan.pdf',
    comment: 'Primera versión del proyecto de investigación.',
    status: 'reviewed',
    submittedAt: '2024-05-10T09:00:00.000Z',
    reviewedAt: '2024-05-15T14:30:00.000Z',
    grade: 8.5,
    finalComment:
      'El documento cumple con los criterios establecidos. Se recomienda ampliar la sección de metodología en futuras versiones.',
  },
  {
    id: 'sub-2',
    studentId: 'u-4',
    documentName: 'Tesis_Investigacion_Maria.pdf',
    comment: 'Entrega correspondiente al segundo semestre.',
    status: 'under-review',
    submittedAt: '2024-05-12T11:00:00.000Z',
  },
];

const assignments: Assignment[] = [
  { id: 'a-1', evaluatorId: 'u-1', studentId: 'u-3', createdAt: '2024-05-01T00:00:00.000Z' },
  { id: 'a-2', evaluatorId: 'u-1', studentId: 'u-4', createdAt: '2024-05-01T00:00:00.000Z' },
  { id: 'a-3', evaluatorId: 'u-2', studentId: 'u-5', createdAt: '2024-05-01T00:00:00.000Z' },
];

// ─── Stage templates ──────────────────────────────────────────────────────────

function buildStages(): ReviewStage[] {
  return [
    {
      id: 'stage-1', name: 'Estructura', order: 1, status: 'in-progress',
      criteria: [
        { id: 's1-c1', label: 'El documento contiene una introducción clara', category: 'Estructura', status: 'pending', observation: '' },
        { id: 's1-c2', label: 'Los objetivos están claramente definidos', category: 'Estructura', status: 'pending', observation: '' },
        { id: 's1-c3', label: 'La hipótesis o pregunta de investigación está planteada', category: 'Estructura', status: 'pending', observation: '' },
      ],
    },
    {
      id: 'stage-2', name: 'Metodología', order: 2, status: 'pending',
      criteria: [
        { id: 's2-c1', label: 'La metodología es apropiada para el tipo de investigación', category: 'Metodología', status: 'pending', observation: '' },
        { id: 's2-c2', label: 'La población de estudio está correctamente definida', category: 'Metodología', status: 'pending', observation: '' },
        { id: 's2-c3', label: 'Los instrumentos de recolección están descritos', category: 'Metodología', status: 'pending', observation: '' },
      ],
    },
    {
      id: 'stage-3', name: 'Resultados', order: 3, status: 'pending',
      criteria: [
        { id: 's3-c1', label: 'Los resultados se presentan de forma clara y ordenada', category: 'Resultados', status: 'pending', observation: '' },
        { id: 's3-c2', label: 'El análisis estadístico es correcto y justificado', category: 'Resultados', status: 'pending', observation: '' },
        { id: 's3-c3', label: 'Las conclusiones responden a los objetivos planteados', category: 'Resultados', status: 'pending', observation: '' },
      ],
    },
    {
      id: 'stage-4', name: 'Formato', order: 4, status: 'pending',
      criteria: [
        { id: 's4-c1', label: 'Las referencias bibliográficas están en formato APA', category: 'Formato', status: 'pending', observation: '' },
        { id: 's4-c2', label: 'El documento cumple con los criterios de extensión mínima', category: 'Formato', status: 'pending', observation: '' },
      ],
    },
  ];
}

const reviews: Review[] = [
  {
    id: 'rev-1',
    submissionId: 'sub-1',
    evaluatorId: 'u-1',
    studentId: 'u-3',
    currentStageIndex: 3,
    finalComment: 'El documento cumple con los criterios establecidos. Se recomienda ampliar la sección de metodología en futuras versiones.',
    completedAt: '2024-05-15T14:30:00.000Z',
    grade: 8.5,
    stages: buildStages().map((s) => ({
      ...s,
      status: 'completed' as const,
      criteria: s.criteria.map((c) => ({ ...c, status: 'approved' as const })),
    })),
  },
  {
    id: 'rev-2',
    submissionId: 'sub-2',
    evaluatorId: 'u-1',
    studentId: 'u-4',
    currentStageIndex: 1,
    stages: buildStages().map((s, i) => ({
      ...s,
      status: i === 0 ? ('completed' as const) : i === 1 ? ('in-progress' as const) : ('pending' as const),
      criteria: s.criteria.map((c) => ({
        ...c,
        status: i === 0 ? ('approved' as const) : ('pending' as const),
      })),
    })),
  },
];

// ─── Service ──────────────────────────────────────────────────────────────────

const delay = (ms = 150) => new Promise<void>((r) => setTimeout(r, ms));

export const platformService = {
  // Users
  async getUsers(): Promise<User[]> {
    await delay();
    return structuredClone(MOCK_USERS);
  },

  // Submissions
  async getSubmissionForStudent(studentId: string): Promise<StudentSubmission | null> {
    await delay();
    return structuredClone(submissions.find((s) => s.studentId === studentId) ?? null);
  },

  async getAllSubmissions(): Promise<StudentSubmission[]> {
    await delay();
    return structuredClone(submissions);
  },

  async createSubmission(studentId: string, documentName: string, comment: string): Promise<StudentSubmission> {
    await delay();
    const sub: StudentSubmission = {
      id: `sub-${Date.now()}`,
      studentId,
      documentName,
      comment,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    submissions.push(sub);
    return structuredClone(sub);
  },

  async updateSubmission(id: string, patch: Partial<Pick<StudentSubmission, 'documentName' | 'comment'>>): Promise<StudentSubmission> {
    await delay();
    const idx = submissions.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Submission not found');
    submissions[idx] = { ...submissions[idx], ...patch };
    return structuredClone(submissions[idx]);
  },

  async deleteSubmission(id: string): Promise<void> {
    await delay();
    const idx = submissions.findIndex((s) => s.id === id);
    if (idx !== -1) submissions.splice(idx, 1);
  },

  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    await delay();
    return structuredClone(assignments);
  },

  async getAssignmentsForEvaluator(evaluatorId: string): Promise<Assignment[]> {
    await delay();
    return structuredClone(assignments.filter((a) => a.evaluatorId === evaluatorId));
  },

  async createAssignment(evaluatorId: string, studentId: string): Promise<Assignment> {
    await delay();
    const exists = assignments.find((a) => a.evaluatorId === evaluatorId && a.studentId === studentId);
    if (exists) return structuredClone(exists);
    const a: Assignment = { id: `a-${Date.now()}`, evaluatorId, studentId, createdAt: new Date().toISOString() };
    assignments.push(a);
    return structuredClone(a);
  },

  async deleteAssignment(id: string): Promise<void> {
    await delay();
    const idx = assignments.findIndex((a) => a.id === id);
    if (idx !== -1) assignments.splice(idx, 1);
  },

  // Reviews
  async getOrCreateReview(submissionId: string, evaluatorId: string): Promise<Review> {
    await delay();
    const existing = reviews.find((r) => r.submissionId === submissionId);
    if (existing) return structuredClone(existing);
    const sub = submissions.find((s) => s.id === submissionId);
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      submissionId,
      evaluatorId,
      studentId: sub?.studentId ?? '',
      currentStageIndex: 0,
      stages: buildStages(),
    };
    reviews.push(newReview);
    return structuredClone(newReview);
  },

  async saveReview(review: Review): Promise<void> {
    await delay(100);
    const idx = reviews.findIndex((r) => r.id === review.id);
    if (idx !== -1) reviews[idx] = structuredClone(review);
    // Sync submission status when review is completed
    if (review.completedAt) {
      const subIdx = submissions.findIndex((s) => s.id === review.submissionId);
      if (subIdx !== -1) {
        submissions[subIdx] = {
          ...submissions[subIdx],
          status: 'reviewed',
          reviewedAt: review.completedAt,
          grade: review.grade,
          finalComment: review.finalComment,
        };
      }
    }
  },
};
