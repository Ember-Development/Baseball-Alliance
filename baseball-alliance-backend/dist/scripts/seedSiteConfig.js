/**
 * One-off production SiteConfig bootstrap (ECS task).
 * Ensures at least one SiteConfig row exists so GET /api/site returns 200.
 * Requires DATABASE_URL (and existing Prisma migrations).
 *
 * Idempotent: if any SiteConfig exists, exits successfully without changes.
 *
 * Optional env:
 * - SITE_WHO_WE_ARE_INITIAL — body text for the initial row (defaults below).
 */
import { PrismaClient } from "@prisma/client";
const DEFAULT_WHO_WE_ARE = "Baseball Alliance connects players, teams, and events across the country.";
async function main() {
    if (!process.env.DATABASE_URL?.trim()) {
        console.error("DATABASE_URL is missing or empty");
        process.exit(1);
    }
    const whoWeAre = process.env.SITE_WHO_WE_ARE_INITIAL?.trim() || DEFAULT_WHO_WE_ARE;
    const prisma = new PrismaClient();
    try {
        const existing = await prisma.siteConfig.findFirst({
            orderBy: { updatedAt: "desc" },
            select: { id: true },
        });
        if (existing) {
            console.log(`SiteConfig already exists (id=${existing.id}). Nothing to do.`);
            return;
        }
        const created = await prisma.siteConfig.create({
            data: { whoWeAre },
        });
        console.log(`Created SiteConfig id=${created.id}`);
    }
    finally {
        await prisma.$disconnect();
    }
}
main().catch((e) => {
    console.error("seedSiteConfig failed:", e);
    process.exit(1);
});
