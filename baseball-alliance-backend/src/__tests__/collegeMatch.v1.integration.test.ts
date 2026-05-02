import "dotenv/config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../db.js";

const fixtures = [
  {
    schoolName: "INT_TEST_A State University",
    division: "NCAA D1",
    conference: "SEC",
    state: "TX",
    schoolType: "Public",
    schoolSize: "large",
    tuitionBand: "moderate",
    city: "Austin",
  },
  {
    schoolName: "INT_TEST_B College",
    division: "NCAA D2",
    conference: "Gulf South",
    state: "FL",
    schoolType: "Private",
    schoolSize: "medium",
    tuitionBand: "high",
    city: "Tampa",
  },
  {
    schoolName: "INT_TEST_RICE Memorial",
    division: "NCAA D1",
    conference: "AAC",
    state: "TX",
    schoolType: "Private",
    schoolSize: "medium",
    tuitionBand: "high",
    city: "Houston",
  },
];

describe("College match V1 (integration)", () => {
  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set to run integration tests");
    }
    await prisma.collegeProgram.deleteMany({
      where: { schoolName: { startsWith: "INT_TEST_" } },
    });
    await prisma.collegeProgram.createMany({ data: fixtures });
  });

  afterAll(async () => {
    await prisma.collegeProgram.deleteMany({
      where: { schoolName: { startsWith: "INT_TEST_" } },
    });
    await prisma.$disconnect();
  });

  it("GET /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, scope: "api" });
  });

  describe("GET /api/programs", () => {
    it("returns paginated shape with defaults", async () => {
      const res = await request(app).get("/api/programs").query({
        state: "TX",
      });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        data: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        limit: 20,
        totalPages: expect.any(Number),
      });
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("rejects page < 1", async () => {
      const res = await request(app).get("/api/programs").query({ page: 0 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation failed");
      expect(res.body.details.fieldErrors.length).toBeGreaterThan(0);
    });

    it("rejects limit > 100", async () => {
      const res = await request(app).get("/api/programs").query({ limit: 101 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation failed");
    });

    it("filters by division and state", async () => {
      const res = await request(app).get("/api/programs").query({
        division: "NCAA D1",
        state: "TX",
        limit: 10,
      });
      expect(res.status).toBe(200);
      for (const row of res.body.data) {
        expect(row.division).toBe("NCAA D1");
        expect(row.state).toBe("TX");
      }
    });

    it("search returns Rice subset when fixture exists", async () => {
      const res = await request(app).get("/api/programs").query({
        search: "rice",
        limit: 50,
      });
      expect(res.status).toBe(200);
      const names = res.body.data.map((r: { schoolName: string }) =>
        r.schoolName.toLowerCase()
      );
      expect(names.some((n: string) => n.includes("rice"))).toBe(true);
    });
  });

  describe("GET /api/programs/filters", () => {
    it("returns distinct metadata arrays", async () => {
      const res = await request(app).get("/api/programs/filters");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        divisions: expect.any(Array),
        conferences: expect.any(Array),
        states: expect.any(Array),
        schoolTypes: expect.any(Array),
      });
      expect(res.body.states).toContain("TX");
    });
  });

  describe("GET /api/programs/:id", () => {
    it("404 for unknown id", async () => {
      const res = await request(app).get(
        "/api/programs/clxxxxxxxxxxxxxxxxxxxxxxxxx"
      );
      expect(res.status).toBe(404);
    });

    it("200 returns row", async () => {
      const first = await prisma.collegeProgram.findFirst({
        where: { schoolName: { startsWith: "INT_TEST_" } },
      });
      expect(first).toBeTruthy();
      const res = await request(app).get(`/api/programs/${first!.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(first!.id);
      expect(res.body.schoolName).toBe(first!.schoolName);
    });
  });

  describe("POST /api/match", () => {
    const fullPitcher = {
      playerType: "pitcher",
      primaryPosition: "RHP",
      secondaryPosition: "OF",
      gradYear: 2026,
      handedness: "R",
      gpa: 3.7,
      preferredStates: ["TX"],
      preferredDivisions: ["NCAA D1"],
      preferredConferences: ["SEC"],
      schoolTypePreference: "Public",
      schoolSizePreference: "large",
      tuitionPreference: "moderate",
      priorities: {
        athleticFit: 0.3,
        locationFit: 0.3,
        schoolFit: 0.2,
        affordabilityFit: 0.2,
      },
      metrics: {
        fastballVelocity: 88,
        topVelocity: 90,
        strikePercentage: 62,
        sixtyTime: 7.2,
      },
    };

    const fullHitter = {
      playerType: "hitter",
      primaryPosition: "SS",
      secondaryPosition: "2B",
      gradYear: 2027,
      handedness: "L",
      gpa: 3.4,
      preferredStates: ["FL"],
      preferredDivisions: ["NCAA D2"],
      preferredConferences: ["Gulf South"],
      schoolTypePreference: "Private",
      schoolSizePreference: "medium",
      tuitionPreference: "high",
      priorities: {
        athleticFit: 0.25,
        locationFit: 0.25,
        schoolFit: 0.25,
        affordabilityFit: 0.25,
      },
      metrics: {
        avgExitVelocity: 92,
        maxExitVelocity: 98,
        strikePercentage: 55,
        sixtyTime: 6.9,
      },
    };

    it("happy path full pitcher body — MatchResponseV1 shape", async () => {
      const res = await request(app).post("/api/match").send(fullPitcher);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        matches: expect.any(Array),
        totalEvaluated: expect.any(Number),
        totalReturned: expect.any(Number),
        total: expect.any(Number),
      });
      expect(res.body.matches.length).toBeGreaterThan(0);
      const m = res.body.matches[0];
      expect(m).toMatchObject({
        id: expect.any(String),
        schoolName: expect.any(String),
        division: expect.any(String),
        conference: expect.any(String),
        state: expect.any(String),
        overallScore: expect.any(Number),
        fitLabel: expect.any(String),
        reasons: expect.any(Array),
        scoreBreakdown: {
          athleticFit: expect.any(Number),
          locationFit: expect.any(Number),
          schoolFit: expect.any(Number),
          affordabilityFit: expect.any(Number),
        },
      });
    });

    it("happy path full hitter body", async () => {
      const res = await request(app).post("/api/match").send(fullHitter);
      expect(res.status).toBe(200);
      expect(res.body.matches.length).toBeGreaterThan(0);
    });

    it("minimal body (required + empty preference arrays)", async () => {
      const res = await request(app)
        .post("/api/match")
        .send({ playerType: "hitter", primaryPosition: "C" });
      expect(res.status).toBe(200);
      expect(res.body.totalEvaluated).toBeGreaterThanOrEqual(3);
    });

    it("pagination: limit and offset change totalReturned and respect total", async () => {
      const all = await request(app)
        .post("/api/match?limit=50&offset=0")
        .send({ playerType: "hitter", primaryPosition: "1B" });
      expect(all.status).toBe(200);
      const total = all.body.total as number;

      const p1 = await request(app)
        .post("/api/match?limit=2&offset=0")
        .send({ playerType: "hitter", primaryPosition: "1B" });
      expect(p1.body.matches).toHaveLength(Math.min(2, total));
      expect(p1.body.total).toBe(total);

      const p2 = await request(app)
        .post("/api/match?limit=2&offset=2")
        .send({ playerType: "hitter", primaryPosition: "1B" });
      if (total >= 3) {
        expect(p2.body.matches).toHaveLength(Math.min(2, total - 2));
      }
      expect(p2.body.total).toBe(total);
    });

    it("invalid body: bad playerType → 400", async () => {
      const res = await request(app)
        .post("/api/match")
        .send({ playerType: "both", primaryPosition: "1B" });
      expect(res.status).toBe(400);
    });

    it("invalid body: missing primaryPosition → 400 + details", async () => {
      const res = await request(app)
        .post("/api/match")
        .send({ playerType: "hitter" });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation failed");
      const paths = res.body.details.fieldErrors.flatMap(
        (fe: { path: string[] }) => fe.path.join(".")
      );
      expect(paths.some((p: string) => p.includes("primaryPosition"))).toBe(
        true
      );
    });

    it("invalid schoolSizePreference enum → 400", async () => {
      const res = await request(app)
        .post("/api/match")
        .send({
          playerType: "hitter",
          primaryPosition: "1B",
          schoolSizePreference: "xlarge",
        });
      expect(res.status).toBe(400);
      expect(res.body.details).toBeDefined();
    });

    it("invalid gpa → 400", async () => {
      const res = await request(app).post("/api/match").send({
        playerType: "hitter",
        primaryPosition: "1B",
        gpa: 5,
      });
      expect(res.status).toBe(400);
    });

    it("invalid priorities range → 400", async () => {
      const res = await request(app).post("/api/match").send({
        playerType: "hitter",
        primaryPosition: "1B",
        priorities: { athleticFit: 2 },
      });
      expect(res.status).toBe(400);
    });

    it("invalid metrics range → 400", async () => {
      const res = await request(app).post("/api/match").send({
        playerType: "pitcher",
        primaryPosition: "RHP",
        metrics: { topVelocity: 200 },
      });
      expect(res.status).toBe(400);
    });

    it("invalid query: limit 0 → 400", async () => {
      const res = await request(app)
        .post("/api/match?limit=0")
        .send({ playerType: "hitter", primaryPosition: "1B" });
      expect(res.status).toBe(400);
    });

    it("invalid query: limit 201 → 400", async () => {
      const res = await request(app)
        .post("/api/match?limit=201")
        .send({ playerType: "hitter", primaryPosition: "1B" });
      expect(res.status).toBe(400);
    });

    it("invalid query: negative offset → 400", async () => {
      const res = await request(app)
        .post("/api/match?offset=-1")
        .send({ playerType: "hitter", primaryPosition: "1B" });
      expect(res.status).toBe(400);
    });

    it("empty programs table → zero totals (restores rows after)", async () => {
      const backup = await prisma.collegeProgram.findMany();
      await prisma.collegeProgram.deleteMany({});
      try {
        const res = await request(app)
          .post("/api/match")
          .send({ playerType: "hitter", primaryPosition: "1B" });
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          matches: [],
          totalEvaluated: 0,
          totalReturned: 0,
          total: 0,
        });
      } finally {
        if (backup.length) {
          await prisma.collegeProgram.createMany({
            data: backup.map(
              ({
                id: _id,
                createdAt: _c,
                updatedAt: _u,
                ...rest
              }) => rest
            ),
          });
        }
      }
    });
  });
});
