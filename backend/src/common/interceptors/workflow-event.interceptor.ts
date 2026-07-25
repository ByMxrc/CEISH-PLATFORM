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
      tap(async (responseBody: unknown) => {
        if (!responseBody || typeof responseBody !== 'object' || !user) {
          return;
        }

        const body = responseBody as Record<string, unknown>;
        const entityId = this.extractEntityId(body);
        const entityType = this.inferEntityType(url);
        const previousStatus = this.extractPreviousStatus(body);
        const newStatus = this.extractNewStatus(body);
        const investigationId = this.extractInvestigationId(body);

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
    return (body.id as string) ?? (this.getData(body).id as string) ?? null;
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
    return (body.previousStatus as string) ?? (this.getData(body).previousStatus as string) ?? null;
  }

  private extractNewStatus(body: Record<string, unknown>): string | null {
    return (body.status as string) ?? (this.getData(body).status as string) ?? null;
  }

  private extractInvestigationId(body: Record<string, unknown>): string | null {
    return (
      (body.investigationId as string) ??
      (this.getData(body).investigationId as string) ??
      (this.getData(body).investigation_id as string) ??
      null
    );
  }

  private getData(body: Record<string, unknown>): Record<string, unknown> {
    const data = body.data;
    return data && typeof data === 'object' ? data as Record<string, unknown> : {};
  }
}
