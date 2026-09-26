import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  // load prisma via dynamic import after dotenv
  const { prisma } = await import("../src/lib/db");
  try {
    const products = await prisma.product.count();
    const visible = await prisma.product.count({
      where: { isVisible: true, isDeleted: false },
    });
    console.log("DB Stats:", { products, visible });
  } catch (e) {
    console.error("DB Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
