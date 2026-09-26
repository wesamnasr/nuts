import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Testing connection via DIRECT_URL...");
  // Using direct URL (usually bypasses pooler)
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_URL,
      },
    },
  });

  try {
    const count = await prisma.product.count();
    console.log(`Success! Found ${count} products.`);
  } catch (e) {
    console.error("Connection failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
