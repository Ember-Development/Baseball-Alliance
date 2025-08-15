// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Baseball Alliance…");

  /* ───────────────── Users & Roles ───────────────── */
  const playerUser = await prisma.user.create({
    data: {
      email: "player1@example.com",
      fullName: "Luke Anderson",
      phone: "(555) 111-2222",
      dob: new Date("2008-06-15"),
      roles: { create: [{ role: "PLAYER" }] },
      player: {
        create: {
          primaryPosition: "P",
          secondaryPosition: "SS",
          bats: "Right",
          throws: "Right",
          height: `5'11"`,
          weight: "175 lb",
          gradYear: "2026",
          schoolGrade: "11",
          schoolName: "Waco HS",
          schoolLocation: "Waco, TX",
          clubTeam: "Bombers",
          coachName: "Coach Taylor",
          coachContact: "coach.taylor@hs.edu",
          shirtSize: "M",
        },
      },
    },
  });

  const coachUser = await prisma.user.create({
    data: {
      email: "coach1@example.com",
      fullName: "A. Coach",
      phone: "(555) 222-3333",
      roles: { create: [{ role: "COACH" }] },
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      fullName: "Site Admin",
      phone: "(555) 000-0000",
      roles: { create: [{ role: "ADMIN" }] },
      admin: {
        create: {
          bio: "Making youth baseball awesome.",
          funFact: "Once hit for the cycle.",
          socials: { x: "@ba_admin", instagram: "@ba_admin" },
          orgRole: "Director",
        },
      },
    },
  });

  /* ───────────────── Team & Coach link ───────────────── */
  const team = await prisma.team.create({
    data: {
      name: "Texas Bombers 16U",
      city: "New Braunfels",
      state: "TX",
      ageDivision: "U16",
    },
  });

  await prisma.coachProfile.create({
    data: { userId: coachUser.id, teamId: team.id },
  });

  await prisma.teamPlayer.create({
    data: { teamId: team.id, playerUserId: playerUser.id },
  });

  /* ───────────────── Events ───────────────── */
  const combineEvent = await prisma.event.create({
    data: {
      title: "San Antonio Summer Combine",
      type: "COMBINE",
      startDate: new Date("2025-09-10T09:00:00Z"),
      endDate: new Date("2025-09-10T17:00:00Z"),
      startTime: "09:00 AM",
      city: "San Antonio",
      state: "TX",
      venue: "Blossom Athletic Center",
      isPublished: true,
    },
  });

  const showcaseEvent = await prisma.event.create({
    data: {
      title: "DFW Fall Showcase",
      type: "SHOWCASE",
      startDate: new Date("2025-10-05T14:00:00Z"),
      endDate: new Date("2025-10-05T19:00:00Z"),
      city: "Arlington",
      state: "TX",
      venue: "Choctaw Stadium",
      isPublished: true,
    },
  });

  const tournamentEvent = await prisma.event.create({
    data: {
      title: "Gulf Coast Classic",
      type: "TOURNAMENT",
      startDate: new Date("2025-11-15T14:00:00Z"),
      endDate: new Date("2025-11-17T22:00:00Z"),
      city: "Houston",
      state: "TX",
      venue: "Memorial Park",
      isPublished: true,
    },
  });

  /* ───────────────── Registrations + Payments ───────────────── */
  const combineReg = await prisma.combineRegistration.create({
    data: {
      eventId: combineEvent.id,
      userId: playerUser.id,
      status: "PAID",

      playerFullName: playerUser.fullName,
      dob: new Date("2008-06-15"),
      city: "Waco",
      state: "TX",
      zip: "76701",
      playerPhone: "(555) 111-2222",
      playerEmail: "player1@example.com",

      parentFullName: "Jennifer Anderson",
      parentPhone: "(555) 333-4444",
      parentEmail: "jennifer.anderson@example.com",
      parentConsentUnder13: false,

      emergencyName: "Mark Anderson",
      emergencyPhone: "(555) 999-0000",

      primaryPosition: "P",
      secondaryPosition: "SS",
      bats: "Right",
      throws: "Right",
      height: `5'11"`,
      weight: "175 lb",

      gradYear: "2026",
      schoolGrade: "11",
      schoolName: "Waco HS",
      schoolLocation: "Waco, TX",
      clubTeam: "Bombers",
      coachName: "Coach Taylor",
      coachContact: "coach.taylor@hs.edu",

      shirtSize: "M",
      agreeToWaiver: true,
      privacyAck: true,
    },
  });

  await prisma.combinePayment.create({
    data: {
      combineRegistrationId: combineReg.id,
      provider: "manual",
      providerRef: "COMB-TEST-001",
      amountCents: 15000,
      currency: "USD",
      status: "SUCCEEDED",
    },
  });

  const showcaseReg = await prisma.showcaseRegistration.create({
    data: {
      eventId: showcaseEvent.id,
      userId: playerUser.id,
      status: "PAID",

      playerFullName: playerUser.fullName,
      dob: new Date("2008-06-15"),
      city: "Waco",
      state: "TX",
      zip: "76701",
      playerPhone: "(555) 111-2222",
      playerEmail: "player1@example.com",

      parentFullName: "Jennifer Anderson",
      parentPhone: "(555) 333-4444",
      parentEmail: "jennifer.anderson@example.com",
      parentConsentUnder13: false,

      emergencyName: "Mark Anderson",
      emergencyPhone: "(555) 999-0000",

      primaryPosition: "P",
      secondaryPosition: "SS",
      bats: "Right",
      throws: "Right",
      height: `5'11"`,
      weight: "175 lb",

      gradYear: "2026",
      schoolGrade: "11",
      schoolName: "Waco HS",
      schoolLocation: "Waco, TX",
      clubTeam: "Bombers",
      coachName: "Coach Taylor",
      coachContact: "coach.taylor@hs.edu",

      shirtSize: "M",
      agreeToWaiver: true,
      privacyAck: true,
    },
  });

  await prisma.showcasePayment.create({
    data: {
      showcaseRegistrationId: showcaseReg.id,
      provider: "manual",
      providerRef: "SHOW-TEST-001",
      amountCents: 12500,
      currency: "USD",
      status: "SUCCEEDED",
    },
  });

  const tournamentReg = await prisma.tournamentRegistration.create({
    data: {
      eventId: tournamentEvent.id,
      submittedByUserId: coachUser.id,
      teamId: team.id,
      status: "PAID",

      teamName: team.name,
      orgName: "Texas Bombers",
      ageDivision: "U16",
      teamCity: team.city,
      teamState: team.state,

      managerName: "Jamie Manager",
      managerEmail: "manager@example.com",
      managerPhone: "(555) 444-5555",

      coachName: coachUser.fullName,
      coachEmail: "coach1@example.com",
      coachPhone: "(555) 222-3333",

      rosterJson: {
        players: [
          { name: "Luke Anderson", pos: "P/SS", gradYear: "2026" },
          { name: "Evan Brooks", pos: "C", gradYear: "2026" },
        ],
      },
      notes: "Ready to compete.",
    },
  });

  await prisma.tournamentPayment.create({
    data: {
      tournamentRegistrationId: tournamentReg.id,
      provider: "manual",
      providerRef: "TOUR-TEST-001",
      amountCents: 49500,
      currency: "USD",
      status: "SUCCEEDED",
    },
  });

  /* ───────────────── Media & CMS ───────────────── */
  const media = await prisma.media.create({
    data: {
      type: "HIGHLIGHT",
      title: "Luke Anderson — Pitching Highlights",
      url: "https://example.com/highlights/luke-anderson.mp4",
      thumbnailUrl: "https://example.com/thumbs/luke.jpg",
      description: "Fastball up to 88, sharp slider.",
      visibility: "PUBLIC",
      createdByUserId: adminUser.id,
      playerTags: { create: [{ playerUserId: playerUser.id }] },
      teamTags: { create: [{ teamId: team.id }] },
      eventTags: { create: [{ eventId: combineEvent.id }] },
      publishedAt: new Date(),
    },
  });

  const site = await prisma.siteConfig.create({
    data: {
      whoWeAre:
        "Baseball Alliance connects players, teams, and events across the country with elite combines, showcases, and tournaments.",
      featuredEventId: combineEvent.id,
      solutions: {
        create: [
          {
            name: "For Players",
            order: 1,
            items: {
              create: [
                {
                  title: "Elite Combines",
                  body: "Verified metrics and video.",
                },
                { title: "Showcase Access", body: "Get seen by scouts." },
              ],
            },
          },
          {
            name: "For Teams",
            order: 2,
            items: {
              create: [
                {
                  title: "Tournaments",
                  body: "Competitive brackets, great venues.",
                },
                {
                  title: "Scheduling",
                  body: "Streamlined registration & payments.",
                },
              ],
            },
          },
        ],
      },
      whoWeAreImages: {
        create: [
          {
            url: "https://example.com/img/ba-1.jpg",
            alt: "Players at combine",
            order: 1,
          },
          {
            url: "https://example.com/img/ba-2.jpg",
            alt: "Showcase batting",
            order: 2,
          },
        ],
      },
      ctas: {
        create: [
          {
            label: "Register for a Combine",
            href: "/events?type=COMBINE",
            style: "primary",
            order: 1,
          },
          {
            label: "Explore Tournaments",
            href: "/events?type=TOURNAMENT",
            style: "ghost",
            order: 2,
          },
        ],
      },
      structure: {
        create: [
          { title: "Baseball Alliance", body: "Operations & Events", order: 1 },
          { title: "Media", body: "Highlights and podcasts", order: 2 },
        ],
      },
      memberships: {
        create: [
          {
            name: "Player",
            blurb: "Access combines & showcases",
            perks: ["Event discounts", "Priority registration"],
            priceCents: 4900,
            order: 1,
          },
          {
            name: "Team",
            blurb: "Tournament perks",
            perks: ["Roster tools", "Bracket priority"],
            priceCents: 14900,
            order: 2,
          },
        ],
      },
      headers: {
        create: [
          {
            pageKey: "home",
            title: "Welcome to Baseball Alliance",
            subtitle: "Grow your game.",
            imageUrl: null,
          },
          {
            pageKey: "events",
            title: "Events",
            subtitle: "Combines, showcases, tournaments",
            imageUrl: null,
          },
          {
            pageKey: "membership",
            title: "Membership",
            subtitle: "Perks for players & teams",
            imageUrl: null,
          },
        ],
      },
    },
  });

  const scout = await prisma.scout.create({
    data: {
      fullName: "Casey Scout",
      org: "Independent",
      email: "scout@example.com",
      phone: "(555) 777-8888",
      notes: "Covers Central Texas HS/JUCO.",
    },
  });

  console.log("✅ Seed complete:", {
    users: [playerUser.email, coachUser.email, adminUser.email],
    team: team.name,
    events: [combineEvent.title, showcaseEvent.title, tournamentEvent.title],
    media: media.title,
    siteId: site.id,
    scout: scout.fullName,
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
