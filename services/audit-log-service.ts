import { prisma } from "@/database/prisma";
import type { Prisma } from "@prisma/client";

export type AuditAction =
  | "game.create"
  | "game.update"
  | "game.delete"
  | "post.create"
  | "post.update"
  | "post.delete"
  | "user.ban"
  | "user.role_change"
  | "report.resolve"
  | "report.dismiss"
  | "settings.update"
  | "admin.bootstrap"
  | "upload.file";

export interface AuditLogEntry {
  actorId?: string | null;
  actorEmail?: string | null;
  action: AuditAction;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

/**
 * Records an admin action to the AuditLog table.
 * Fails silently — audit logging must never break the primary action.
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  if (!prisma) return;

  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        actorEmail: entry.actorEmail ?? null,
        action: entry.action,
        targetType: entry.targetType ?? null,
        targetId: entry.targetId ?? null,
        metadata: entry.metadata != null
          ? (JSON.parse(JSON.stringify(entry.metadata)) as Prisma.InputJsonValue)
          : undefined,
        ipAddress: entry.ipAddress ?? null
      }
    });
  } catch {
    // Silently swallow audit errors — never let logging break a user operation
  }
}

/**
 * Extracts IP address from a request for audit logging.
 */
export function getAuditIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return request.headers.get("x-real-ip") ?? null;
}
