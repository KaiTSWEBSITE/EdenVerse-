import { prisma } from "@/database/prisma";
import { adjustReputationOnce, getLevelFromReputation } from "@/services/member-progression-service";

export type GameReportInput = {
  contactEmail?: string;
  description: string;
  gameSlug: string;
  issueType: string;
  reporterId?: string | null;
  title: string;
};

type StoredGameReport = GameReportInput & {
  adminNote?: string | null;
  createdAt: string;
  id: string;
  penalizedPoints: number;
  reviewedAt?: string | null;
  status: "OPEN" | "RESOLVED" | "REJECTED";
};

export type AdminGameReportSummary = StoredGameReport & {
  reporter?: {
    id: string;
    email: string;
    level: number;
    name: string;
    reputation: number;
    username: string;
  } | null;
};

declare global {
  var __edenverseGameReports__: StoredGameReport[] | undefined;
}

const memoryReports = global.__edenverseGameReports__ ?? [];
global.__edenverseGameReports__ = memoryReports;

function serializeReport(report: {
  adminNote?: string | null;
  contactEmail?: string | null;
  createdAt: Date;
  description: string;
  gameSlug: string;
  id: string;
  issueType: string;
  penalizedPoints?: number | null;
  reporter?: AdminGameReportSummary["reporter"];
  reporterId?: string | null;
  reviewedAt?: Date | null;
  status: string;
  title: string;
}): AdminGameReportSummary {
  return {
    id: report.id,
    gameSlug: report.gameSlug,
    issueType: report.issueType,
    title: report.title,
    description: report.description,
    contactEmail: report.contactEmail ?? undefined,
    reporterId: report.reporterId ?? null,
    reporter: report.reporter ?? null,
    adminNote: report.adminNote ?? null,
    penalizedPoints: report.penalizedPoints ?? 0,
    reviewedAt: report.reviewedAt?.toISOString() ?? null,
    status: report.status as StoredGameReport["status"],
    createdAt: report.createdAt.toISOString()
  };
}

export async function createGameReport(input: GameReportInput) {
  const report: StoredGameReport = {
    ...input,
    createdAt: new Date().toISOString(),
    id: crypto.randomUUID(),
    penalizedPoints: 0,
    status: "OPEN"
  };

  memoryReports.unshift(report);

  if (prisma) {
    try {
      return serializeReport(
        await prisma.gameReport.create({
          data: {
            id: report.id,
            gameSlug: report.gameSlug,
            issueType: report.issueType,
            title: report.title,
            description: report.description,
            contactEmail: report.contactEmail ?? null,
            reporterId: report.reporterId ?? null,
            status: report.status
          },
          include: {
            reporter: {
              select: {
                id: true,
                email: true,
                level: true,
                name: true,
                reputation: true,
                username: true
              }
            }
          }
        })
      );
    } catch {
      // The report still stays in memory when the database migration is not available yet.
    }
  }

  return report;
}

export async function getAdminGameReports(limit = 30) {
  if (!prisma) {
    return memoryReports.slice(0, limit);
  }

  try {
    const reports = await prisma.gameReport.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            level: true,
            name: true,
            reputation: true,
            username: true
          }
        }
      }
    });

    return reports.map(serializeReport);
  } catch {
    return memoryReports.slice(0, limit);
  }
}

export async function deleteGameReport(reportId: string) {
  const memoryIndex = memoryReports.findIndex((r) => r.id === reportId);
  if (memoryIndex > -1) {
    memoryReports.splice(memoryIndex, 1);
  }

  if (prisma) {
    try {
      await prisma.gameReport.delete({
        where: { id: reportId }
      });
      return true;
    } catch {
      return false;
    }
  }

  return memoryIndex > -1;
}

export async function moderateGameReport({
  adminNote,
  penaltyPoints,
  reportId,
  status
}: {
  adminNote?: string;
  penaltyPoints?: number;
  reportId: string;
  status: "OPEN" | "RESOLVED" | "REJECTED";
}) {
  if (!prisma) {
    return { report: null, progression: null };
  }

  const report = await prisma.gameReport.findUnique({
    where: { id: reportId },
    include: {
      reporter: {
        select: {
          id: true,
          email: true,
          level: true,
          name: true,
          reputation: true,
          username: true
        }
      }
    }
  });

  if (!report) {
    return { report: null, progression: null };
  }

  const pointsToSubtract = Math.max(0, Math.min(500, Math.trunc(penaltyPoints ?? 0)));
  const progression =
    pointsToSubtract > 0 && report.reporterId
      ? await adjustReputationOnce({
          userId: report.reporterId,
          action: "admin_report_penalty",
          targetType: "report",
          targetId: report.id,
          points: -pointsToSubtract
        })
      : null;

  const updatedReport = await prisma.gameReport.update({
    where: { id: reportId },
    data: {
      status,
      adminNote: adminNote?.trim() || null,
      penalizedPoints: progression ? pointsToSubtract : report.penalizedPoints,
      reviewedAt: status === "OPEN" ? null : new Date()
    },
    include: {
      reporter: {
        select: {
          id: true,
          email: true,
          level: true,
          name: true,
          reputation: true,
          username: true
        }
      }
    }
  });

  return {
    report: serializeReport(updatedReport),
    progression
  };
}

export async function subtractMemberReputation({
  identifier,
  points,
  reason
}: {
  identifier: string;
  points: number;
  reason: string;
}) {
  if (!prisma) {
    return null;
  }

  const trimmedIdentifier = identifier.trim();
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: trimmedIdentifier }, { email: trimmedIdentifier.toLowerCase() }]
    },
    select: {
      id: true,
      email: true,
      level: true,
      name: true,
      reputation: true,
      username: true
    }
  });

  if (!user) {
    return null;
  }

  const safePoints = Math.max(1, Math.min(1000, Math.trunc(points)));
  const progression = await adjustReputationOnce({
    userId: user.id,
    action: "admin_manual_penalty",
    targetType: "admin",
    targetId: crypto.randomUUID(),
    points: -safePoints
  });

  return {
    progression,
    reason: reason.trim(),
    user: progression
      ? {
          ...user,
          level: progression.level,
          reputation: progression.reputation
        }
      : {
          ...user,
          level: getLevelFromReputation(user.reputation),
          reputation: user.reputation
        }
  };
}

export function getRecentGameReports(limit = 10) {
  return memoryReports.slice(0, limit);
}
