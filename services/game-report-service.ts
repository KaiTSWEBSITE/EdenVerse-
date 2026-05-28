import { prisma } from "@/database/prisma";

export type GameReportInput = {
  contactEmail?: string;
  description: string;
  gameSlug: string;
  issueType: string;
  title: string;
};

type StoredGameReport = GameReportInput & {
  createdAt: string;
  id: string;
  status: "OPEN";
};

declare global {
  var __edenverseGameReports__: StoredGameReport[] | undefined;
}

const memoryReports = global.__edenverseGameReports__ ?? [];
global.__edenverseGameReports__ = memoryReports;

export async function createGameReport(input: GameReportInput) {
  const report: StoredGameReport = {
    ...input,
    createdAt: new Date().toISOString(),
    id: crypto.randomUUID(),
    status: "OPEN"
  };

  memoryReports.unshift(report);

  if (prisma) {
    try {
      await prisma.$executeRaw`
        INSERT INTO "GameReport" ("id", "gameSlug", "issueType", "title", "description", "contactEmail", "status", "createdAt")
        VALUES (${report.id}, ${report.gameSlug}, ${report.issueType}, ${report.title}, ${report.description}, ${report.contactEmail ?? null}, ${report.status}, NOW())
      `;
    } catch {
      // The report still stays in memory when the database migration is not available yet.
    }
  }

  return report;
}

export function getRecentGameReports(limit = 10) {
  return memoryReports.slice(0, limit);
}
