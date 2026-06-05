-- CreateEnum
CREATE TYPE "public"."BamsMatchStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "public"."BamsEventUpload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT,
    "eventName" TEXT,
    "eventStartDate" TEXT,
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "warnings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BamsEventUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BamsEventAthleteRow" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "athleteUuid" TEXT NOT NULL,
    "eventName" TEXT,
    "eventStartDate" TEXT,
    "eventDivision" TEXT,
    "eventLevel" TEXT,
    "orderDate" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "playerId" TEXT,
    "athleteUrl" TEXT,
    "primaryPosition" TEXT NOT NULL,
    "gradYear" INTEGER,
    "rawRow" JSONB NOT NULL,
    "parseErrors" JSONB,
    "matchRequest" JSONB,
    "matchStatus" "public"."BamsMatchStatus" NOT NULL DEFAULT 'PENDING',
    "matchResponse" JSONB,
    "matchError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BamsEventAthleteRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BamsEventUpload_userId_createdAt_idx" ON "public"."BamsEventUpload"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BamsEventAthleteRow_uploadId_idx" ON "public"."BamsEventAthleteRow"("uploadId");

-- CreateIndex
CREATE INDEX "BamsEventAthleteRow_uploadId_eventName_idx" ON "public"."BamsEventAthleteRow"("uploadId", "eventName");

-- CreateIndex
CREATE UNIQUE INDEX "BamsEventAthleteRow_uploadId_athleteUuid_key" ON "public"."BamsEventAthleteRow"("uploadId", "athleteUuid");

-- AddForeignKey
ALTER TABLE "public"."BamsEventUpload" ADD CONSTRAINT "BamsEventUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BamsEventAthleteRow" ADD CONSTRAINT "BamsEventAthleteRow_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "public"."BamsEventUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
