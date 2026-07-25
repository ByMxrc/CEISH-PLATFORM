import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@common/decorators';
import { UserType } from '@common/enums';
import { RolesGuard } from '@common/guards';
import { CloseCorrectionDto, OpenCorrectionDto } from '../../application/dto';
import { AssignEvaluatorsUseCase, CloseCorrectionUseCase, OpenCorrectionUseCase } from '../../application/use-cases';

@ApiTags('Evaluation') @ApiBearerAuth() @Controller('admin/evaluation')
@UseGuards(AuthGuard('jwt'), RolesGuard) @Roles(UserType.ADMIN)
export class AdminEvaluationController {
  constructor(private assign:AssignEvaluatorsUseCase,private open:OpenCorrectionUseCase,private close:CloseCorrectionUseCase){}
  @Post('investigation/:investigationId/assign') async assignEvaluators(@CurrentUser()u:any,@Param('investigationId')id:string,@Body()d:{memberIds:string[]}){return{success:true,data:await this.assign.execute(u.id,u.userType,id,d.memberIds)}}
  @Post(':processId/correction') async openCorrection(@Param('processId')id:string,@Body()d:OpenCorrectionDto){return{success:true,data:await this.open.execute(id,d)}}
  @Post(':processId/correction/:roundId/close') async closeCorrection(@Param('roundId')id:string,@Body()d:CloseCorrectionDto){return{success:true,data:await this.close.execute(id,d)}}
}
