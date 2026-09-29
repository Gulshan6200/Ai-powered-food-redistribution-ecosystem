import { prisma } from '../prisma.js';

export interface AuditParams {
  userId?: string;
  userName?: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  organizationId?: string;
}

export async function recordAuditLog(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName || 'System Action',
        userRole: params.userRole || 'SYSTEM',
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
        newValue: params.newValue ? JSON.stringify(params.newValue) : null,
        organizationId: params.organizationId
      }
    });
  } catch (error) {
    console.error('Failed to record audit log:', error);
  }
}
