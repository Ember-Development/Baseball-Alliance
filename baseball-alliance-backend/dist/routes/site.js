// src/routes/site.ts
import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/requireAuth.js";
import { PatchSiteSchema, UploadUrlRequestSchema, PutCmsPageSchema, } from "../types/site.js";
import { createPresignedPutUrl, isS3UploadConfigured, } from "../services/presignMedia.js";
const r = Router();
const SITE_INCLUDE = {
    featuredEvent: true,
    whoWeAreImages: { orderBy: { order: "asc" } },
    solutions: {
        orderBy: { order: "asc" },
        include: {
            items: { orderBy: { order: "asc" } },
        },
    },
    ctas: { orderBy: { order: "asc" } },
    structure: { orderBy: { order: "asc" } },
    memberships: { orderBy: { order: "asc" } },
    headers: true,
    pages: {
        include: { blocks: { orderBy: { sortOrder: "asc" } } },
    },
};
function toEventPublic(e) {
    return {
        id: e.id,
        title: e.title,
        type: e.type,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
        startTime: e.startTime,
        city: e.city,
        state: e.state,
        venue: e.venue,
        registerUrl: e.registerUrl ?? null,
        isPublished: e.isPublished,
    };
}
function mapPageToPublicAdmin(p) {
    return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        published: p.published,
        blocks: p.blocks.map((b) => ({
            id: b.id,
            blockType: b.blockType,
            sortOrder: b.sortOrder,
            props: (b.props ?? {}),
        })),
    };
}
function buildSitePublic(row, pages) {
    return {
        id: row.id,
        whoWeAre: row.whoWeAre,
        whoWeAreSections: row.whoWeAreSections,
        featuredEventId: row.featuredEventId,
        featuredEvent: row.featuredEvent ? toEventPublic(row.featuredEvent) : null,
        heroEyebrow: row.heroEyebrow,
        heroHeadline: row.heroHeadline,
        heroSubcopy: row.heroSubcopy,
        heroCtaLabel: row.heroCtaLabel,
        heroCtaHref: row.heroCtaHref,
        heroPosterUrl: row.heroPosterUrl,
        heroVideoDesktopUrl: row.heroVideoDesktopUrl,
        heroVideoMobileUrl: row.heroVideoMobileUrl,
        contactCta: row.contactCta ?? null,
        membershipVideoUrl: row.membershipVideoUrl,
        membershipCtaUrl: row.membershipCtaUrl,
        membershipPage: row.membershipPage,
        leadershipPage: row.leadershipPage,
        whoWeAreImages: row.whoWeAreImages.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            title: img.title,
            body: img.body,
            order: img.order,
        })),
        solutions: row.solutions.map((c) => ({
            id: c.id,
            name: c.name,
            order: c.order,
            items: c.items.map((it) => ({
                id: it.id,
                title: it.title,
                body: it.body,
                icon: it.icon,
                order: it.order,
            })),
        })),
        ctas: row.ctas.map((c) => ({
            id: c.id,
            label: c.label,
            href: c.href,
            style: c.style,
            order: c.order,
        })),
        structure: row.structure.map((s) => ({
            id: s.id,
            title: s.title,
            body: s.body,
            order: s.order,
        })),
        memberships: row.memberships.map((m) => ({
            id: m.id,
            name: m.name,
            blurb: m.blurb,
            perks: m.perks,
            priceCents: m.priceCents,
            order: m.order,
        })),
        headers: row.headers.map((h) => ({
            id: h.id,
            pageKey: h.pageKey,
            title: h.title,
            subtitle: h.subtitle,
            imageUrl: h.imageUrl,
        })),
        pages,
    };
}
function toSitePublicAdmin(row) {
    return buildSitePublic(row, row.pages.map((p) => mapPageToPublicAdmin(p)));
}
export async function getActiveSiteRow() {
    return prisma.siteConfig.findFirst({
        orderBy: { updatedAt: "desc" },
        include: SITE_INCLUDE,
    });
}
/** Public: strip blocks from unpublished CMS pages */
function toSitePublicMasked(row) {
    const pages = row.pages.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        published: p.published,
        blocks: p.published
            ? p.blocks.map((b) => ({
                id: b.id,
                blockType: b.blockType,
                sortOrder: b.sortOrder,
                props: (b.props ?? {}),
            }))
            : [],
    }));
    return buildSitePublic(row, pages);
}
r.get("/", async (_req, res, next) => {
    try {
        const row = await getActiveSiteRow();
        if (!row)
            return res.status(404).json({ error: "Site configuration not found" });
        return res.json(toSitePublicMasked(row));
    }
    catch (e) {
        next(e);
    }
});
r.get("/admin", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
    try {
        const row = await getActiveSiteRow();
        if (!row)
            return res.status(404).json({ error: "Site configuration not found" });
        return res.json(toSitePublicAdmin(row));
    }
    catch (e) {
        next(e);
    }
});
r.patch("/", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
    try {
        const parsed = PatchSiteSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const patch = parsed.data;
        const row = await getActiveSiteRow();
        if (!row)
            return res.status(404).json({ error: "Site configuration not found" });
        const id = row.id;
        await prisma.$transaction(async (tx) => {
            const scalar = {};
            if (patch.whoWeAre !== undefined)
                scalar.whoWeAre = patch.whoWeAre;
            if (patch.whoWeAreSections !== undefined) {
                scalar.whoWeAreSections =
                    patch.whoWeAreSections === null
                        ? Prisma.JsonNull
                        : patch.whoWeAreSections;
                if (patch.whoWeAreSections !== null) {
                    const joined = patch.whoWeAreSections.map((s) => s.body).join("\n\n");
                    scalar.whoWeAre =
                        joined.length > 0 ? joined : patch.whoWeAre ?? row.whoWeAre;
                }
            }
            if (patch.featuredEventId !== undefined) {
                if (patch.featuredEventId === null) {
                    scalar.featuredEvent = { disconnect: true };
                }
                else {
                    scalar.featuredEvent = { connect: { id: patch.featuredEventId } };
                }
            }
            if (patch.heroEyebrow !== undefined)
                scalar.heroEyebrow = patch.heroEyebrow;
            if (patch.heroHeadline !== undefined)
                scalar.heroHeadline = patch.heroHeadline;
            if (patch.heroSubcopy !== undefined)
                scalar.heroSubcopy = patch.heroSubcopy;
            if (patch.heroCtaLabel !== undefined)
                scalar.heroCtaLabel = patch.heroCtaLabel;
            if (patch.heroCtaHref !== undefined)
                scalar.heroCtaHref = patch.heroCtaHref;
            if (patch.heroPosterUrl !== undefined)
                scalar.heroPosterUrl = patch.heroPosterUrl;
            if (patch.heroVideoDesktopUrl !== undefined)
                scalar.heroVideoDesktopUrl = patch.heroVideoDesktopUrl;
            if (patch.heroVideoMobileUrl !== undefined)
                scalar.heroVideoMobileUrl = patch.heroVideoMobileUrl;
            if (patch.contactCta !== undefined)
                scalar.contactCta =
                    patch.contactCta === null
                        ? Prisma.JsonNull
                        : patch.contactCta;
            if (patch.membershipVideoUrl !== undefined)
                scalar.membershipVideoUrl = patch.membershipVideoUrl;
            if (patch.membershipCtaUrl !== undefined)
                scalar.membershipCtaUrl = patch.membershipCtaUrl;
            if (patch.membershipPage !== undefined) {
                scalar.membershipPage =
                    patch.membershipPage === null
                        ? Prisma.JsonNull
                        : patch.membershipPage;
            }
            if (patch.leadershipPage !== undefined) {
                scalar.leadershipPage =
                    patch.leadershipPage === null
                        ? Prisma.JsonNull
                        : patch.leadershipPage;
            }
            if (Object.keys(scalar).length > 0) {
                await tx.siteConfig.update({ where: { id }, data: scalar });
            }
            if (patch.whoWeAreImages !== undefined) {
                const incoming = patch.whoWeAreImages;
                const keepIds = incoming.map((i) => i.id).filter(Boolean);
                if (keepIds.length === 0) {
                    await tx.siteImage.deleteMany({ where: { siteConfigId: id } });
                }
                else {
                    await tx.siteImage.deleteMany({
                        where: { siteConfigId: id, id: { notIn: keepIds } },
                    });
                }
                for (const img of incoming) {
                    if (img.id) {
                        await tx.siteImage.update({
                            where: { id: img.id },
                            data: {
                                url: img.url,
                                alt: img.alt ?? null,
                                title: img.title ?? null,
                                body: img.body ?? null,
                                order: img.order ?? 0,
                            },
                        });
                    }
                    else {
                        await tx.siteImage.create({
                            data: {
                                siteConfigId: id,
                                url: img.url,
                                alt: img.alt ?? null,
                                title: img.title ?? null,
                                body: img.body ?? null,
                                order: img.order ?? 0,
                            },
                        });
                    }
                }
            }
            if (patch.solutions !== undefined) {
                await tx.solutionCategory.deleteMany({ where: { siteConfigId: id } });
                for (const cat of patch.solutions) {
                    await tx.solutionCategory.create({
                        data: {
                            siteConfigId: id,
                            name: cat.name,
                            order: cat.order ?? 0,
                            items: {
                                create: cat.items.map((it) => ({
                                    title: it.title,
                                    body: it.body,
                                    icon: it.icon ?? null,
                                    order: it.order ?? 0,
                                })),
                            },
                        },
                    });
                }
            }
            if (patch.ctas !== undefined) {
                await tx.callToAction.deleteMany({ where: { siteConfigId: id } });
                await tx.callToAction.createMany({
                    data: patch.ctas.map((c) => ({
                        siteConfigId: id,
                        label: c.label,
                        href: c.href,
                        style: c.style ?? null,
                        order: c.order ?? 0,
                    })),
                });
            }
            if (patch.structure !== undefined) {
                await tx.orgStructureItem.deleteMany({ where: { siteConfigId: id } });
                await tx.orgStructureItem.createMany({
                    data: patch.structure.map((s) => ({
                        siteConfigId: id,
                        title: s.title,
                        body: s.body,
                        order: s.order ?? 0,
                    })),
                });
            }
            if (patch.memberships !== undefined) {
                await tx.membershipTier.deleteMany({ where: { siteConfigId: id } });
                for (const m of patch.memberships) {
                    await tx.membershipTier.create({
                        data: {
                            siteConfigId: id,
                            name: m.name,
                            blurb: m.blurb ?? null,
                            perks: m.perks === null || m.perks === undefined
                                ? Prisma.JsonNull
                                : m.perks,
                            priceCents: m.priceCents ?? null,
                            order: m.order ?? 0,
                        },
                    });
                }
            }
            if (patch.headers !== undefined) {
                await tx.pageHeader.deleteMany({ where: { siteConfigId: id } });
                await tx.pageHeader.createMany({
                    data: patch.headers.map((h) => ({
                        siteConfigId: id,
                        pageKey: h.pageKey,
                        title: h.title,
                        subtitle: h.subtitle ?? null,
                        imageUrl: h.imageUrl ?? null,
                    })),
                });
            }
        });
        const updated = await getActiveSiteRow();
        if (!updated)
            return res.status(500).json({ error: "Site missing after update" });
        return res.json(toSitePublicAdmin(updated));
    }
    catch (e) {
        next(e);
    }
});
r.post("/media/upload-url", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
    try {
        if (!isS3UploadConfigured()) {
            return res.status(503).json({
                error: "S3 uploads not configured. Set S3_BUCKET, AWS keys, and S3_PUBLIC_URL_PREFIX.",
            });
        }
        const parsed = UploadUrlRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const { filename, contentType, kind } = parsed.data;
        const out = await createPresignedPutUrl({ filename, contentType, kind });
        return res.json(out);
    }
    catch (e) {
        if (e?.status === 400) {
            return res.status(400).json({ error: e.message });
        }
        next(e);
    }
});
r.get("/pages/:slug", async (req, res, next) => {
    try {
        const site = await getActiveSiteRow();
        if (!site)
            return res.status(404).json({ error: "Not found" });
        const page = await prisma.cmsPage.findFirst({
            where: {
                siteConfigId: site.id,
                slug: req.params.slug,
                published: true,
            },
            include: { blocks: { orderBy: { sortOrder: "asc" } } },
        });
        if (!page)
            return res.status(404).json({ error: "Not found" });
        return res.json({
            slug: page.slug,
            title: page.title,
            blocks: page.blocks.map((b) => ({
                id: b.id,
                blockType: b.blockType,
                sortOrder: b.sortOrder,
                props: (b.props ?? {}),
            })),
        });
    }
    catch (e) {
        next(e);
    }
});
const adminPages = Router({ mergeParams: true });
adminPages.put("/:slug", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
    try {
        const slug = req.params.slug;
        if (!slug || slug.length > 120) {
            return res.status(400).json({ error: "Invalid slug" });
        }
        const parsed = PutCmsPageSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.flatten() });
        }
        const body = parsed.data;
        const site = await getActiveSiteRow();
        if (!site)
            return res.status(404).json({ error: "Site configuration not found" });
        const page = await prisma.cmsPage.upsert({
            where: {
                siteConfigId_slug: { siteConfigId: site.id, slug },
            },
            create: {
                siteConfigId: site.id,
                slug,
                title: body.title ?? null,
                published: body.published ?? false,
            },
            update: {
                ...(body.title !== undefined ? { title: body.title } : {}),
                ...(body.published !== undefined ? { published: body.published } : {}),
            },
        });
        if (body.blocks !== undefined) {
            await prisma.$transaction(async (tx) => {
                await tx.cmsPageBlock.deleteMany({ where: { pageId: page.id } });
                let i = 0;
                for (const b of body.blocks) {
                    await tx.cmsPageBlock.create({
                        data: {
                            pageId: page.id,
                            blockType: b.blockType,
                            sortOrder: b.sortOrder ?? i,
                            props: (b.props ?? {}),
                        },
                    });
                    i += 1;
                }
            });
        }
        const full = await prisma.cmsPage.findUnique({
            where: { id: page.id },
            include: { blocks: { orderBy: { sortOrder: "asc" } } },
        });
        if (!full)
            return res.status(500).json({ error: "Page missing" });
        return res.json(mapPageToPublicAdmin(full));
    }
    catch (e) {
        next(e);
    }
});
r.use("/pages", adminPages);
export default r;
