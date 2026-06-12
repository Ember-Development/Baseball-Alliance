-- CreateEnum
CREATE TYPE "BamsMembershipTier" AS ENUM ('BAMS', 'BAMS_PREMIUM');

-- AlterTable
ALTER TABLE "BamsMemberProfile"
ADD COLUMN "membership" "BamsMembershipTier" NOT NULL DEFAULT 'BAMS',
ADD COLUMN "matchRunsUsed" INTEGER NOT NULL DEFAULT 0;
