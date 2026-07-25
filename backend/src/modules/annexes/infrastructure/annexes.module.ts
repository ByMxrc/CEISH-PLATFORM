import { Module } from '@nestjs/common';import{ANNEX_REPOSITORY}from'../domain/repositories/annex.repository.interface';import{AnnexPrismaRepository}from'./repositories';import*as U from'../application/use-cases';
import { AnnexDomainService } from '../domain/services/annex-domain.service';

@Module({
  providers: [AnnexDomainService,AnnexPrismaRepository,{provide:ANNEX_REPOSITORY,useExisting:AnnexPrismaRepository},...Object.values(U)],
  exports: [AnnexDomainService],
})
export class AnnexesModule {}
