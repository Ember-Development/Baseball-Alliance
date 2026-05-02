-- AlterTable
ALTER TABLE "public"."SiteConfig" ADD COLUMN     "heroEyebrow" TEXT,
ADD COLUMN     "heroHeadline" TEXT,
ADD COLUMN     "heroSubcopy" TEXT,
ADD COLUMN     "heroCtaLabel" TEXT,
ADD COLUMN     "heroCtaHref" TEXT,
ADD COLUMN     "heroPosterUrl" TEXT,
ADD COLUMN     "heroVideoDesktopUrl" TEXT,
ADD COLUMN     "heroVideoMobileUrl" TEXT,
ADD COLUMN     "contactCta" JSONB,
ADD COLUMN     "membershipVideoUrl" TEXT,
ADD COLUMN     "membershipCtaUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."SiteImage" ADD COLUMN     "title" TEXT,
ADD COLUMN     "body" TEXT;

-- CreateTable
CREATE TABLE "public"."CmsPage" (
    "id" TEXT NOT NULL,
    "siteConfigId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CmsPageBlock" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "blockType" TEXT NOT NULL,
    "props" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPageBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CmsPage_siteConfigId_slug_key" ON "public"."CmsPage"("siteConfigId", "slug");

-- AddForeignKey
ALTER TABLE "public"."CmsPage" ADD CONSTRAINT "CmsPage_siteConfigId_fkey" FOREIGN KEY ("siteConfigId") REFERENCES "public"."SiteConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CmsPageBlock" ADD CONSTRAINT "CmsPageBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."CmsPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
