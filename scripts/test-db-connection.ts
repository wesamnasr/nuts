import dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("Testing database connection...");

  // Dynamic import ensures dotenv is loaded BEFORE db.ts is evaluated
  const { prisma } = await import("../src/lib/db");

  try {
    const productCount = await prisma.product.count();
    console.log(`Successfully connected! Found ${productCount} products.`);

    const categories = await prisma.category.count();
    console.log(`Found ${categories} categories.`);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    process.exit(0);
  }
}

main();
