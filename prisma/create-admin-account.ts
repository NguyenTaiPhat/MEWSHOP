import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("tiemcuamew123", 10);

  // Create or Update Admin with email tiemcuamew@gmail.com
  const adminEmail = await prisma.user.upsert({
    where: { email: "tiemcuamew@gmail.com" },
    update: {
      passwordHash,
      role: Role.ADMIN,
      name: "Tiệm Của Mew Admin",
    },
    create: {
      email: "tiemcuamew@gmail.com",
      passwordHash,
      name: "Tiệm Của Mew Admin",
      role: Role.ADMIN,
      phone: "0901234567",
    },
  });

  // Also create or Update username-based email tiemcuamew
  const adminUsername = await prisma.user.upsert({
    where: { email: "tiemcuamew" },
    update: {
      passwordHash,
      role: Role.ADMIN,
      name: "Tiệm Của Mew Admin",
    },
    create: {
      email: "tiemcuamew",
      passwordHash,
      name: "Tiệm Của Mew Admin",
      role: Role.ADMIN,
      phone: "0901234567",
    },
  });

  console.log("SUCCESSFULLY CREATED ADMIN ACCOUNTS:");
  console.log("Admin 1:", adminEmail.email);
  console.log("Admin 2:", adminUsername.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
