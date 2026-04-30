import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import type { ProgramsQuery } from "../schemas/collegeMatch";

export async function listPrograms(q: ProgramsQuery) {
  const where: Prisma.CollegeProgramWhereInput = {};
  if (q.division) where.division = q.division;
  if (q.conference) where.conference = q.conference;
  if (q.state) where.state = q.state;
  if (q.schoolType) where.schoolType = q.schoolType;
  if (q.search?.trim()) {
    const s = q.search.trim();
    where.OR = [
      { schoolName: { contains: s, mode: "insensitive" } },
      { conference: { contains: s, mode: "insensitive" } },
      { city: { contains: s, mode: "insensitive" } },
    ];
  }

  const skip = (q.page - 1) * q.limit;
  const [total, rows] = await prisma.$transaction([
    prisma.collegeProgram.count({ where }),
    prisma.collegeProgram.findMany({
      where,
      orderBy: { schoolName: "asc" },
      skip,
      take: q.limit,
    }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / q.limit);

  return {
    data: rows,
    total,
    page: q.page,
    limit: q.limit,
    totalPages,
  };
}

export async function programFilters(opts?: { division?: string }) {
  const divisionFilter = opts?.division?.trim();

  const divisionRows = await prisma.collegeProgram.findMany({
    select: { division: true },
    distinct: ["division"],
  });
  const divisions = divisionRows.map((r) => r.division).sort();

  const where: Prisma.CollegeProgramWhereInput = {};
  if (divisionFilter) where.division = divisionFilter;

  const rows = await prisma.collegeProgram.findMany({
    where: Object.keys(where).length ? where : undefined,
    select: {
      conference: true,
      state: true,
      schoolType: true,
    },
  });
  const conferences = [...new Set(rows.map((r) => r.conference))].sort();
  const states = [...new Set(rows.map((r) => r.state))].sort();
  const schoolTypes = [...new Set(rows.map((r) => r.schoolType))].sort();
  return { divisions, conferences, states, schoolTypes };
}

export async function getProgramById(id: string) {
  return prisma.collegeProgram.findUnique({ where: { id } });
}
