-- CreateTable: AuditLog
-- Tracks administrative actions for security monitoring and accountability.
-- This migration only ADDS a new table; existing tables are untouched.

CREATE TABLE "AuditLog" (
    "id"         TEXT NOT NULL,
    "actorId"    TEXT,
    "actorEmail" TEXT,
    "action"     TEXT NOT NULL,
    "targetType" TEXT,
    "targetId"   TEXT,
    "metadata"   JSONB,
    "ipAddress"  TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Indexes for common query patterns
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_action_idx"  ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
