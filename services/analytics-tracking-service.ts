import { prisma } from "@/database/prisma";

function getUtcDayStart(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function recordPageView(fingerprint: string) {
  if (!prisma || !fingerprint) {
    return;
  }

  try {
    const dayStart = getUtcDayStart();
    const day = await prisma.analyticsDay.upsert({
      where: { day: dayStart },
      update: { pageViews: { increment: 1 } },
      create: {
        day: dayStart,
        pageViews: 1
      }
    });

    try {
      await prisma.analyticsVisitor.create({
        data: {
          dayId: day.id,
          fingerprint
        }
      });

      await prisma.analyticsDay.update({
        where: { id: day.id },
        data: { uniqueVisitors: { increment: 1 } }
      });
    } catch {
      // Visitor already counted today; only pageViews should increase.
    }
  } catch {
    // Analytics is best-effort and must never block a page request.
  }
}

export async function recordDownloadMetric() {
  if (!prisma) {
    return;
  }

  try {
    const dayStart = getUtcDayStart();

    await prisma.analyticsDay.upsert({
      where: { day: dayStart },
      update: { downloadClicks: { increment: 1 } },
      create: {
        day: dayStart,
        downloadClicks: 1
      }
    });
  } catch {
    // The per-game download counter still works even if analytics is unavailable.
  }
}
