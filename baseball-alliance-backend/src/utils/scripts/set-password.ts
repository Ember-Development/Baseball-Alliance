import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function run(email: string, plain: string) {
  const hash = await bcrypt.hash(plain, 10);
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash: hash },
    select: { id: true, email: true },
  });
  console.log("Updated:", user);
}

const email = process.argv[2];
const pw = process.argv[3];
if (!email || !pw) {
  console.error("Usage: tsx scripts/set-password.ts <email> <password>");
  process.exit(1);
}

run(email, pw).finally(() => prisma.$disconnect());
