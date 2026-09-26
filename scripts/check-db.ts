import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.product.count();
    const visible = await prisma.product.count({
      where: { isVisible: true, isDeleted: false },
    });
    console.log("DB Stats:", { products, visible });
  } catch (e) {
    console.error("DB Error:", e);
  }
}

main().finally(() => prisma.$disconnect());
