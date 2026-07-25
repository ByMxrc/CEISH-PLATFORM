import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@common/decorators';
import { UserType } from '@common/enums';
import { RolesGuard } from '@common/guards';
import { AddObservationDto, DeclareConflictDto, SubmitEvaluationDto } from '../../application/dto';
import { AddObservationUseCase, DeclareConflictUseCase, GetEvaluatorAssignmentsUseCase, SubmitEvaluationUseCase } from '../../application/use-cases';
@ApiTags('Evaluation') @ApiBearerAuth() @Controller('evaluator/evaluations')
@UseGuards(AuthGuard('jwt'),RolesGuard) @Roles(UserType.CEISH_MEMBER)
export class EvaluatorController {constructor(private assignments:GetEvaluatorAssignmentsUseCase,private conflict:DeclareConflictUseCase,private submit:SubmitEvaluationUseCase,private observations:AddObservationUseCase){}
@Get('assignments') async getAssignments(@CurrentUser()u:any){return{success:true,data:await this.assignments.execute(u.id)}}
@Post('assignments/:assignmentId/conflict') async declare(@CurrentUser()u:any,@Param('assignmentId')id:string,@Body()d:DeclareConflictDto){return{success:true,data:await this.conflict.execute(u.id,id,d)}}
@Post('evaluations/:evaluationId/submit') async submitEvaluation(@CurrentUser()u:any,@Param('evaluationId')id:string,@Body()d:SubmitEvaluationDto){return{success:true,data:await this.submit.execute(u.id,id,d)}}
@Post('evaluations/:evaluationId/observations') async add(@Param('evaluationId')id:string,@Body()d:AddObservationDto){return{success:true,data:await this.observations.execute(id,d)}}}
