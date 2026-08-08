CREATE TABLE "GameRating" (
  "id" TEXT NOT NULL,
  "gameId" TEXT NOT NULL,
  "userId" TEXT,
  "fingerprint" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GameRating_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GameRating_gameId_fingerprint_key" ON "GameRating"("gameId", "fingerprint");
CREATE INDEX "GameRating_gameId_idx" ON "GameRating"("gameId");
CREATE INDEX "GameRating_userId_idx" ON "GameRating"("userId");

ALTER TABLE "GameRating" ADD CONSTRAINT "GameRating_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameRating" ADD CONSTRAINT "GameRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
