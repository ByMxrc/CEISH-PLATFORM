import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from '@modules/auth/auth.module';
import {
  DeleteDocumentUseCase,
  DownloadDocumentUseCase,
  GetDocumentUseCase,
  GetInvestigationDocumentsUseCase,
  UploadDocumentUseCase,
} from '../application/use-cases';
import { DOCUMENT_REPOSITORY } from '../domain/repositories/document.repository.interface';
import { MinioService } from '../domain/services/minio.service';
import { DocumentController } from './controllers';
import { DocumentPrismaRepository } from './repositories';

@Module({
  imports: [AuthModule, MulterModule.register({ dest: './uploads' })],
  controllers: [DocumentController],
  providers: [
    MinioService,
    DocumentPrismaRepository,
    { provide: DOCUMENT_REPOSITORY, useExisting: DocumentPrismaRepository },
    UploadDocumentUseCase,
    GetDocumentUseCase,
    GetInvestigationDocumentsUseCase,
    DeleteDocumentUseCase,
    DownloadDocumentUseCase,
  ],
  exports: [MinioService],
})
export class DocumentsModule {}
