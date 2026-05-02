-- CreateTable
CREATE TABLE "public"."CollegeProgram" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "conference" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "schoolType" TEXT NOT NULL,
    "schoolSize" TEXT NOT NULL DEFAULT 'medium',
    "tuitionBand" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollegeProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollegeProgram_division_idx" ON "public"."CollegeProgram"("division");

-- CreateIndex
CREATE INDEX "CollegeProgram_conference_idx" ON "public"."CollegeProgram"("conference");

-- CreateIndex
CREATE INDEX "CollegeProgram_state_idx" ON "public"."CollegeProgram"("state");

-- CreateIndex
CREATE INDEX "CollegeProgram_schoolType_idx" ON "public"."CollegeProgram"("schoolType");

-- CreateIndex
CREATE INDEX "CollegeProgram_schoolName_idx" ON "public"."CollegeProgram"("schoolName");
