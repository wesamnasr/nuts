import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const username = "admin";
  const password = "password123";

  console.log("Checking for existing admin user...");
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (existingAdmin) {
    console.log("Admin user already exists!");
    return;
  }

  console.log("Creating new admin user...");
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.create({
    data: {
      username,
      passwordHash,
    },
  });

  console.log(`✅ Admin user created!`);
  console.log(`Username: ${username}`);
  console.log(`Password: ${password}`);
  console.log(`Please login and change this password as soon as possible.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
