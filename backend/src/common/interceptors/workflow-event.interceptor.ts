import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma';

@Injectable()
export class WorkflowEventInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (responseBody) => {
        if (!responseBody || !user) {
          return;
        }

        const entityId = this.extractEntityId(responseBody);
        const entityType = this.inferEntityType(url);
        const previousStatus = this.extractPreviousStatus(responseBody);
        const newStatus = this.extractNewStatus(responseBody);
        const investigationId = this.extractInvestigationId(responseBody);

        if (entityType && entityId) {
          await this.prisma.workflowEvent.create({
            data: {
              eventType: 'ADMIN_ACTION',
              actorId: user.id,
              investigationId,
              entityType,
              entityId,
              previousStatus,
              newStatus,
              description: `${user.userType} performed ${method} on ${entityType}`,
              metadata: { method, url },
            },
          });
        }
      }),
    );
  }

  private extractEntityId(body: Record<string, unknown>): string | null {
    return (body.id as string) ?? (body.data?.id as string) ?? null;
  }

  private inferEntityType(url: string): string | null {
    if (url.includes('/investigations')) return 'investigation';
    if (url.includes('/evaluations')) return 'evaluation';
    if (url.includes('/risk-assessment')) return 'risk_assessment';
    if (url.includes('/observations')) return 'observation';
    if (url.includes('/corrections')) return 'correction';
    if (url.includes('/annexes')) return 'annex';
    if (url.includes('/users')) return 'user';
    if (url.includes('/documents')) return 'document';
    return null;
  }

  private extractPreviousStatus(body: Record<string, unknown>): string | null {
    return (body.previousStatus as string) ?? (body.data?.previousStatus as string) ?? null;
  }

  private extractNewStatus(body: Record<string, unknown>): string | null {
    return (body.status as string) ?? (body.data?.status as string) ?? null;
  }

  private extractInvestigationId(body: Record<string, unknown>): string | null {
    return (
      (body.investigationId as string) ??
      (body.data?.investigationId as string) ??
      (body.data?.investigation_id as string) ??
      null
    );
  }
}