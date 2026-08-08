CREATE TABLE "AnalyticsDay" (
  "id" TEXT NOT NULL,
  "day" TIMESTAMP(3) NOT NULL,
  "pageViews" INTEGER NOT NULL DEFAULT 0,
  "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
  "downloadClicks" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AnalyticsDay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsVisitor" (
  "id" TEXT NOT NULL,
  "dayId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AnalyticsVisitor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnalyticsDay_day_key" ON "AnalyticsDay"("day");
CREATE INDEX "AnalyticsDay_day_idx" ON "AnalyticsDay"("day");
CREATE INDEX "AnalyticsVisitor_fingerprint_idx" ON "AnalyticsVisitor"("fingerprint");
CREATE UNIQUE INDEX "AnalyticsVisitor_dayId_fingerprint_key" ON "AnalyticsVisitor"("dayId", "fingerprint");

ALTER TABLE "AnalyticsVisitor"
ADD CONSTRAINT "AnalyticsVisitor_dayId_fkey"
FOREIGN KEY ("dayId") REFERENCES "AnalyticsDay"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
