// Servicio de entregas que orquesta el almacenamiento del PDF (MinIO) y la
// persistencia de la referencia (PostgreSQL).
//
// El mapeo de tipos BD↔UI sigue centralizado en platformService; aquí solo se
// combina la subida del archivo con la creación/edición de la entrega.

import { storageService } from './storage';
import { platformService } from '../shared/services/platformService';
import type { StudentSubmission } from '../shared/types/platform.types';

export const submissionsService = {
  /** Entrega del estudiante (o null). */
  getForStudent(studentId: string): Promise<StudentSubmission | null> {
    return platformService.getSubmissionForStudent(studentId);
  },

  /** Sube el PDF y crea la entrega con su referencia. */
  async createWithDocument(studentId: string, file: File, comment: string): Promise<StudentSubmission> {
    const { documentPath, documentName } = await storageService.uploadDocument(file);
    return platformService.createSubmission(studentId, documentName, comment, documentPath);
  },

  /** Sube el nuevo PDF y actualiza la entrega existente. */
  async updateWithDocument(id: string, file: File, comment: string): Promise<StudentSubmission> {
    const { documentPath, documentName } = await storageService.uploadDocument(file);
    return platformService.updateSubmission(id, { documentName, comment, documentPath });
  },

  /** Solo actualiza el comentario, sin tocar el documento. */
  updateComment(id: string, comment: string): Promise<StudentSubmission> {
    return platformService.updateSubmission(id, { comment });
  },

  remove(id: string): Promise<void> {
    return platformService.deleteSubmission(id);
  },

  /** URL temporal para visualizar el documento. */
  getDocumentUrl(id: string): Promise<string> {
    return storageService.getDocumentUrl(id);
  },
};
