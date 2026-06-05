-- CreateTable
CREATE TABLE "public"."BamsSavedMatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "uploadId" TEXT,
    "athleteUuid" TEXT,
    "athleteName" TEXT NOT NULL,
    "primaryPosition" TEXT,
    "gradYear" INTEGER,
    "eventName" TEXT,
    "eventStartDate" TEXT,
    "label" TEXT,
    "matchResponse" JSONB NOT NULL,
    "preferences" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BamsSavedMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BamsSavedMatch_userId_createdAt_idx" ON "public"."BamsSavedMatch"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."BamsSavedMatch" ADD CONSTRAINT "BamsSavedMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
