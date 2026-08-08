CREATE TABLE "ReputationEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ReputationEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReputationEvent_userId_action_targetType_targetId_key"
ON "ReputationEvent"("userId", "action", "targetType", "targetId");

CREATE INDEX "ReputationEvent_userId_idx" ON "ReputationEvent"("userId");
CREATE INDEX "ReputationEvent_action_idx" ON "ReputationEvent"("action");

ALTER TABLE "ReputationEvent"
ADD CONSTRAINT "ReputationEvent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
