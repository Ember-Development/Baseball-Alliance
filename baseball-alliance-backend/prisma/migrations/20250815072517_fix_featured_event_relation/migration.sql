-- CreateEnum
CREATE TYPE "public"."RoleName" AS ENUM ('PARENT', 'PLAYER', 'COACH', 'SCOUT', 'ADMIN', 'FAN');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('TOURNAMENT', 'COMBINE', 'SHOWCASE');

-- CreateEnum
CREATE TYPE "public"."RegistrationStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('REQUIRES_ACTION', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."AgeDivision" AS ENUM ('U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'JUCO');

-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('VIDEO', 'HIGHLIGHT', 'PODCAST');

-- CreateEnum
CREATE TYPE "public"."Visibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dob" TIMESTAMP(3),
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRole" (
    "userId" TEXT NOT NULL,
    "role" "public"."RoleName" NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","role")
);

-- CreateTable
CREATE TABLE "public"."PlayerProfile" (
    "userId" TEXT NOT NULL,
    "primaryPosition" TEXT NOT NULL,
    "secondaryPosition" TEXT,
    "bats" TEXT NOT NULL,
    "throws" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "gradYear" TEXT NOT NULL,
    "schoolGrade" TEXT NOT NULL,
    "schoolName" TEXT,
    "schoolLocation" TEXT,
    "clubTeam" TEXT,
    "coachName" TEXT,
    "coachContact" TEXT,
    "shirtSize" TEXT NOT NULL,

    CONSTRAINT "PlayerProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."ParentProfile" (
    "userId" TEXT NOT NULL,

    CONSTRAINT "ParentProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."CoachProfile" (
    "userId" TEXT NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "CoachProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."AdminProfile" (
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "funFact" TEXT,
    "socials" JSONB,
    "orgRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."FanProfile" (
    "userId" TEXT NOT NULL,

    CONSTRAINT "FanProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."ParentChild" (
    "parentUserId" TEXT NOT NULL,
    "playerUserId" TEXT NOT NULL,
    "relationType" TEXT,

    CONSTRAINT "ParentChild_pkey" PRIMARY KEY ("parentUserId","playerUserId")
);

-- CreateTable
CREATE TABLE "public"."Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "ageDivision" "public"."AgeDivision" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamPlayer" (
    "teamId" TEXT NOT NULL,
    "playerUserId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "TeamPlayer_pkey" PRIMARY KEY ("teamId","playerUserId")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "public"."EventType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "venue" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "startTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CombineRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "playerFullName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "playerPhone" TEXT NOT NULL,
    "playerEmail" TEXT,
    "parentFullName" TEXT,
    "parentPhone" TEXT,
    "parentEmail" TEXT,
    "parentConsentUnder13" BOOLEAN NOT NULL DEFAULT false,
    "emergencyName" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "primaryPosition" TEXT NOT NULL,
    "secondaryPosition" TEXT,
    "bats" TEXT NOT NULL,
    "throws" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "gradYear" TEXT NOT NULL,
    "schoolGrade" TEXT NOT NULL,
    "schoolName" TEXT,
    "schoolLocation" TEXT,
    "clubTeam" TEXT,
    "coachName" TEXT,
    "coachContact" TEXT,
    "shirtSize" TEXT NOT NULL,
    "agreeToWaiver" BOOLEAN NOT NULL,
    "privacyAck" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CombineRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShowcaseRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "playerFullName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "playerPhone" TEXT NOT NULL,
    "playerEmail" TEXT,
    "parentFullName" TEXT,
    "parentPhone" TEXT,
    "parentEmail" TEXT,
    "parentConsentUnder13" BOOLEAN NOT NULL DEFAULT false,
    "emergencyName" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "primaryPosition" TEXT NOT NULL,
    "secondaryPosition" TEXT,
    "bats" TEXT NOT NULL,
    "throws" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "gradYear" TEXT NOT NULL,
    "schoolGrade" TEXT NOT NULL,
    "schoolName" TEXT,
    "schoolLocation" TEXT,
    "clubTeam" TEXT,
    "coachName" TEXT,
    "coachContact" TEXT,
    "shirtSize" TEXT NOT NULL,
    "agreeToWaiver" BOOLEAN NOT NULL,
    "privacyAck" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShowcaseRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TournamentRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "submittedByUserId" TEXT,
    "teamId" TEXT,
    "status" "public"."RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "teamName" TEXT NOT NULL,
    "orgName" TEXT,
    "ageDivision" "public"."AgeDivision" NOT NULL,
    "teamCity" TEXT NOT NULL,
    "teamState" TEXT NOT NULL,
    "managerName" TEXT NOT NULL,
    "managerEmail" TEXT NOT NULL,
    "managerPhone" TEXT NOT NULL,
    "coachName" TEXT,
    "coachEmail" TEXT,
    "coachPhone" TEXT,
    "rosterJson" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CombinePayment" (
    "id" TEXT NOT NULL,
    "combineRegistrationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'REQUIRES_ACTION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CombinePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShowcasePayment" (
    "id" TEXT NOT NULL,
    "showcaseRegistrationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'REQUIRES_ACTION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcasePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TournamentPayment" (
    "id" TEXT NOT NULL,
    "tournamentRegistrationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerRef" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'REQUIRES_ACTION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Media" (
    "id" TEXT NOT NULL,
    "type" "public"."MediaType" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3),
    "visibility" "public"."Visibility" NOT NULL DEFAULT 'PUBLIC',
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaPlayer" (
    "mediaId" TEXT NOT NULL,
    "playerUserId" TEXT NOT NULL,

    CONSTRAINT "MediaPlayer_pkey" PRIMARY KEY ("mediaId","playerUserId")
);

-- CreateTable
CREATE TABLE "public"."MediaTeam" (
    "mediaId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "MediaTeam_pkey" PRIMARY KEY ("mediaId","teamId")
);

-- CreateTable
CREATE TABLE "public"."MediaEvent" (
    "mediaId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "MediaEvent_pkey" PRIMARY KEY ("mediaId","eventId")
);

-- CreateTable
CREATE TABLE "public"."SiteConfig" (
    "id" TEXT NOT NULL,
    "whoWeAre" TEXT NOT NULL,
    "featuredEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SolutionCategory" (
    "id" TEXT NOT NULL,
    "siteConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SolutionCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SolutionItem" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SolutionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SiteImage" (
    "id" TEXT NOT NULL,
    "siteConfigId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SiteImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CallToAction" (
    "id" TEXT NOT NULL,
    "siteConfigId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "style" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CallToAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrgStructureItem" (
    "id" TEXT NOT NULL,
    "siteConfigId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OrgStructureItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MembershipTier" (
    "id" TEXT NOT NULL,
    "siteConfigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blurb" TEXT,
    "perks" JSONB,
    "priceCents" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MembershipTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PageHeader" (
    "id" TEXT NOT NULL,
    "siteConfigId" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "PageHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Scout" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "org" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Team_state_city_idx" ON "public"."Team"("state", "city");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_city_state_ageDivision_key" ON "public"."Team"("name", "city", "state", "ageDivision");

-- CreateIndex
CREATE INDEX "Event_type_startDate_idx" ON "public"."Event"("type", "startDate");

-- CreateIndex
CREATE INDEX "CombineRegistration_eventId_userId_idx" ON "public"."CombineRegistration"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CombineRegistration_eventId_userId_key" ON "public"."CombineRegistration"("eventId", "userId");

-- CreateIndex
CREATE INDEX "ShowcaseRegistration_eventId_userId_idx" ON "public"."ShowcaseRegistration"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseRegistration_eventId_userId_key" ON "public"."ShowcaseRegistration"("eventId", "userId");

-- CreateIndex
CREATE INDEX "TournamentRegistration_eventId_teamId_idx" ON "public"."TournamentRegistration"("eventId", "teamId");

-- CreateIndex
CREATE INDEX "CombinePayment_provider_providerRef_idx" ON "public"."CombinePayment"("provider", "providerRef");

-- CreateIndex
CREATE INDEX "ShowcasePayment_provider_providerRef_idx" ON "public"."ShowcasePayment"("provider", "providerRef");

-- CreateIndex
CREATE INDEX "TournamentPayment_provider_providerRef_idx" ON "public"."TournamentPayment"("provider", "providerRef");

-- CreateIndex
CREATE INDEX "Media_type_publishedAt_idx" ON "public"."Media"("type", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PageHeader_pageKey_key" ON "public"."PageHeader"("pageKey");

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerProfile" ADD CONSTRAINT "PlayerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParentProfile" ADD CONSTRAINT "ParentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoachProfile" ADD CONSTRAINT "CoachProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CoachProfile" ADD CONSTRAINT "CoachProfile_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FanProfile" ADD CONSTRAINT "FanProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParentChild" ADD CONSTRAINT "ParentChild_parentUserId_fkey" FOREIGN KEY ("parentUserId") REFERENCES "public"."ParentProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParentChild" ADD CONSTRAINT "ParentChild_playerUserId_fkey" FOREIGN KEY ("playerUserId") REFERENCES "public"."PlayerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamPlayer" ADD CONSTRAINT "TeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamPlayer" ADD CONSTRAINT "TeamPlayer_playerUserId_fkey" FOREIGN KEY ("playerUserId") REFERENCES "public"."PlayerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombineRegistration" ADD CONSTRAINT "CombineRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombineRegistration" ADD CONSTRAINT "CombineRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShowcaseRegistration" ADD CONSTRAINT "ShowcaseRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShowcaseRegistration" ADD CONSTRAINT "ShowcaseRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CombinePayment" ADD CONSTRAINT "CombinePayment_combineRegistrationId_fkey" FOREIGN KEY ("combineRegistrationId") REFERENCES "public"."CombineRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShowcasePayment" ADD CONSTRAINT "ShowcasePayment_showcaseRegistrationId_fkey" FOREIGN KEY ("showcaseRegistrationId") REFERENCES "public"."ShowcaseRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentPayment" ADD CONSTRAINT "TournamentPayment_tournamentRegistrationId_fkey" FOREIGN KEY ("tournamentRegistrationId") REFERENCES "public"."TournamentRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaPlayer" ADD CONSTRAINT "MediaPlayer_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaPlayer" ADD CONSTRAINT "MediaPlayer_playerUserId_fkey" FOREIGN KEY ("playerUserId") REFERENCES "public"."PlayerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaTeam" ADD CONSTRAINT "MediaTeam_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaTeam" ADD CONSTRAINT "MediaTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaEvent" ADD CONSTRAINT "MediaEvent_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaEvent" ADD CONSTRAINT "MediaEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SiteConfig" ADD CONSTRAINT "SiteConfig_featuredEventId_fkey" FOREIGN KEY ("featuredEventId") REFERENCES "public"."Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SolutionCategory" ADD CONSTRAINT "SolutionCategory_siteConfigId_fkey" FOREIGN KEY ("siteConfigId") REFERENCES "public"."SiteConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SolutionItem" ADD CONSTRAINT "SolutionItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."SolutionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SiteImage" ADD CONSTRAINT "SiteImage_siteConfigId_fkey" FOREIGN KEY ("siteConfigId") REFERENCES "public"."SiteConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CallToAction" ADD CONSTRAINT "CallToAction_siteConfigId_fkey" FOREIGN KEY ("siteConfigId") REFERENCES "public"."SiteConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrgStructureItem" ADD CONSTRAINT "OrgStructureItem_siteConfigId_fkey" FOREIGN KEY ("siteConfigId") REFERENCES "public"."SiteConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MembershipTier" ADD CONSTRAINT "MembershipTier_siteConfigId_fkey" FOREIGN KEY ("siteConfigId") REFERENCES "public"."SiteConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageHeader" ADD CONSTRAINT "PageHeader_siteConfigId_fkey" FOREIGN KEY ("siteConfigId") REFERENCES "public"."SiteConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
