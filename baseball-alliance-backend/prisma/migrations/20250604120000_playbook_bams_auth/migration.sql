-- AlterEnum
ALTER TYPE "public"."RoleName" ADD VALUE 'MEMBER';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN "playbookId" TEXT,
ADD COLUMN "playbookImportedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."BamsMemberProfile" (
    "userId" TEXT NOT NULL,
    "gradYear" TEXT,
    "primaryPosition" TEXT,
    "secondaryPosition" TEXT,
    "bats" TEXT,
    "throws" TEXT,
    "height" TEXT,
    "weight" TEXT,
    "schoolName" TEXT,
    "schoolLocation" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BamsMemberProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."MagicLinkToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MagicLinkToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_playbookId_key" ON "public"."User"("playbookId");

-- CreateIndex
CREATE UNIQUE INDEX "MagicLinkToken_tokenHash_key" ON "public"."MagicLinkToken"("tokenHash");

-- CreateIndex
CREATE INDEX "MagicLinkToken_userId_idx" ON "public"."MagicLinkToken"("userId");

-- CreateIndex
CREATE INDEX "MagicLinkToken_expiresAt_idx" ON "public"."MagicLinkToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."BamsMemberProfile" ADD CONSTRAINT "BamsMemberProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MagicLinkToken" ADD CONSTRAINT "MagicLinkToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
