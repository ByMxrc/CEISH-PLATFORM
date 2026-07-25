import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@common/prisma';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { InvestigationsModule } from '@modules/investigations/investigations.module';
import { RiskAssessmentModule } from '@modules/risk-assessment/risk-assessment.module';
import { EvaluationModule } from '@modules/evaluation/evaluation.module';
import { AnnexesModule } from '@modules/annexes/annexes.module';
import { DocumentsModule } from '@modules/documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    AuthModule,
    UsersModule,
    InvestigationsModule,
    RiskAssessmentModule,
    EvaluationModule,
    AnnexesModule,
    DocumentsModule,
  ],
})
export class AppModule {}
