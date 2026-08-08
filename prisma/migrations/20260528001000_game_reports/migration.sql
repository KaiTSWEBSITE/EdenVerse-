CREATE TABLE "GameReport" (
    "id" TEXT NOT NULL,
    "gameSlug" TEXT NOT NULL,
    "issueType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contactEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GameReport_gameSlug_idx" ON "GameReport"("gameSlug");
CREATE INDEX "GameReport_status_idx" ON "GameReport"("status");
