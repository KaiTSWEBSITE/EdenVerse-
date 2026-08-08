ALTER TABLE "GameReport"
ADD COLUMN "reporterId" TEXT,
ADD COLUMN "adminNote" TEXT,
ADD COLUMN "penalizedPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "reviewedAt" TIMESTAMP(3);

CREATE INDEX "GameReport_reporterId_idx" ON "GameReport"("reporterId");

ALTER TABLE "GameReport"
ADD CONSTRAINT "GameReport_reporterId_fkey"
FOREIGN KEY ("reporterId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
