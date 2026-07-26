import { ForbiddenException } from '@nestjs/common';
import { UserAccountStatus, UserType } from '@common/enums';
import { PrismaService } from '@common/prisma';
import { UserEntity } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { ApproveUserUseCase } from './approve-user.use-case';
import { RejectUserUseCase } from './reject-user.use-case';
import { SuspendUserUseCase } from './suspend-user.use-case';

const user = (status: UserAccountStatus): UserEntity => ({
  id: 'user-1', name: 'Investigador', email: 'investigador@uleam.edu.ec', userType: UserType.INVESTIGATOR,
  accountStatus: status, createdAt: new Date(), updatedAt: new Date(), investigatorProfile: null, ceishMemberProfile: null,
});

describe('account status transitions', () => {
  let repository: jest.Mocked<Pick<IUserRepository, 'findById' | 'updateStatus' | 'updateInvestigatorProfile'>>;
  let prisma: { workflowEvent: { create: jest.Mock } };

  beforeEach(() => {
    repository = {
      findById: jest.fn(), updateStatus: jest.fn(), updateInvestigatorProfile: jest.fn(),
    };
    prisma = { workflowEvent: { create: jest.fn() } };
  });

  it('approves a pending account and audits the transition', async () => {
    repository.findById.mockResolvedValue(user(UserAccountStatus.PENDING_APPROVAL));
    repository.updateStatus.mockResolvedValue(user(UserAccountStatus.ACTIVE));
    const useCase = new ApproveUserUseCase(repository as unknown as IUserRepository, prisma as unknown as PrismaService);

    const result = await useCase.execute('admin-1', UserType.ADMIN, { userId: 'user-1' });

    expect(result.accountStatus).toBe(UserAccountStatus.ACTIVE);
    expect(repository.updateStatus).toHaveBeenCalledWith('user-1', UserAccountStatus.ACTIVE);
    expect(prisma.workflowEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ eventType: 'USER_APPROVED', previousStatus: UserAccountStatus.PENDING_APPROVAL, newStatus: UserAccountStatus.ACTIVE }) }));
  });

  it('rejects a pending account with its reason in the audit event', async () => {
    repository.findById.mockResolvedValue(user(UserAccountStatus.PENDING_APPROVAL));
    repository.updateStatus.mockResolvedValue(user(UserAccountStatus.REJECTED));
    const useCase = new RejectUserUseCase(repository as unknown as IUserRepository, prisma as unknown as PrismaService);

    await useCase.execute('admin-1', UserType.ADMIN, { userId: 'user-1', reason: 'La documentación institucional está incompleta.' });

    expect(repository.updateStatus).toHaveBeenCalledWith('user-1', UserAccountStatus.REJECTED);
    expect(prisma.workflowEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ eventType: 'USER_REJECTED', metadata: { reason: 'La documentación institucional está incompleta.' } }) }));
  });

  it('suspends an active account with its reason in the audit event', async () => {
    repository.findById.mockResolvedValue(user(UserAccountStatus.ACTIVE));
    repository.updateStatus.mockResolvedValue(user(UserAccountStatus.SUSPENDED));
    const useCase = new SuspendUserUseCase(repository as unknown as IUserRepository, prisma as unknown as PrismaService);

    await useCase.execute('admin-1', UserType.ADMIN, { userId: 'user-1', reason: 'Cuenta deshabilitada por revisión administrativa.' });

    expect(repository.updateStatus).toHaveBeenCalledWith('user-1', UserAccountStatus.SUSPENDED);
    expect(prisma.workflowEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ eventType: 'ADMIN_ACTION', newStatus: UserAccountStatus.SUSPENDED, metadata: { reason: 'Cuenta deshabilitada por revisión administrativa.' } }) }));
  });

  it('denies account administration to non-administrators', async () => {
    const useCase = new ApproveUserUseCase(repository as unknown as IUserRepository, prisma as unknown as PrismaService);
    await expect(useCase.execute('member-1', UserType.CEISH_MEMBER, { userId: 'user-1' })).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.findById).not.toHaveBeenCalled();
  });
});
