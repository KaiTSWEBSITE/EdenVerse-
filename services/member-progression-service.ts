import { Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";

type ReputationAction =
  | "bookmark_game"
  | "rate_game"
  | "download_game"
  | "report_game"
  | "admin_report_penalty"
  | "admin_manual_penalty";

type ReputationTargetType = "game" | "report" | "user" | "admin";

type AdjustReputationInput = {
  userId?: string | null;
  action: ReputationAction;
  targetType: ReputationTargetType;
  targetId: string;
  points: number;
};

export const reputationRewards: Record<Extract<ReputationAction, "bookmark_game" | "rate_game" | "download_game" | "report_game">, number> = {
  bookmark_game: 5,
  rate_game: 4,
  download_game: 2,
  report_game: 8
};

export function getLevelFromReputation(reputation: number) {
  const safeReputation = Math.max(0, reputation);
  return Math.min(99, Math.floor(Math.sqrt(safeReputation / 20)) + 1);
}

export async function adjustReputationOnce({
  userId,
  action,
  targetType,
  targetId,
  points
}: AdjustReputationInput) {
  if (!prisma || !userId || !targetId || points === 0) {
    return null;
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.reputationEvent.create({
        data: {
          userId,
          action,
          targetType,
          targetId,
          points
        }
      });

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { reputation: true }
      });

      if (!user) {
        return null;
      }

      const nextReputation = Math.max(0, user.reputation + points);

      return tx.user.update({
        where: { id: userId },
        data: {
          reputation: nextReputation,
          level: getLevelFromReputation(nextReputation)
        },
        select: {
          level: true,
          reputation: true
        }
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null;
    }

    return null;
  }
}

export const awardReputationOnce = adjustReputationOnce;
