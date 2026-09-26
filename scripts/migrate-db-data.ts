
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

async function migrateData() {
  const oldUrl = process.env.OLD_DATABASE_URL;
  const newUrl = process.env.DATABASE_URL;

  if (!oldUrl || !newUrl) {
    throw new Error("Missing OLD_DATABASE_URL or DATABASE_URL in environment");
  }

  console.log("Connecting to source (old) database...");
  const oldPool = new Pool({ connectionString: oldUrl });
  const oldAdapter = new PrismaPg(oldPool);
  const oldPrisma = new PrismaClient({ adapter: oldAdapter });

  console.log("Connecting to target (new) database...");
  const newPool = new Pool({ connectionString: newUrl });
  const newAdapter = new PrismaPg(newPool);
  const newPrisma = new PrismaClient({ adapter: newAdapter });

  try {
    console.log("Starting data transfer...");

    // Order matters for foreign keys
    const tables = [
      "AdminUser",
      "Category",
      "Product",
      "ProductImage",
      "ProductVariant",
      "Cart",
      "CartItem",
      "Policy",
      "Setting",
      "LandingPageConfig",
      "CustomerPhoto",
      "StoreFeature",
      "ProductCollection",
      "ProductCollectionItem",
      "Review",
      "PortfolioCategory",
      "PortfolioItem",
      "PortfolioConfig",
      "AboutSection"
    ];

    // Delete in reverse order to respect foreign keys
    console.log("\n--- Cleaning up target database ---");
    for (const table of [...tables].reverse()) {
      const targetModel: any = (newPrisma as any)[table.charAt(0).toLowerCase() + table.slice(1)];
      await targetModel.deleteMany();
      console.log(`Cleared ${table}`);
    }

    for (const table of tables) {
      console.log(`\n--- Migrating ${table} ---`);
      const model: any = (oldPrisma as any)[table.charAt(0).toLowerCase() + table.slice(1)];
      const targetModel: any = (newPrisma as any)[table.charAt(0).toLowerCase() + table.slice(1)];

      const data = await model.findMany();
      console.log(`Found ${data.length} records.`);

      if (data.length > 0) {
        try {
          // Prisma createMany might not be supported on all drivers or might have issues with explicit IDs
          // We'll try it first, then fall back to individual creates
          await targetModel.createMany({
            data: data,
            skipDuplicates: true
          });
          console.log(`Successfully migrated ${table} using createMany.`);
        } catch (e: any) {
          console.log(`createMany failed for ${table}: ${e.message}. Attempting individual inserts...`);
          for (const item of data) {
            try {
              await targetModel.create({ data: item });
            } catch (innerError: any) {
              // If it already exists, just log it
              if (innerError.code === 'P2002') {
                console.log(`Record in ${table} already exists, skipping.`);
              } else {
                console.error(`Failed to insert record into ${table}:`, innerError.message);
              }
            }
          }
           console.log(`Finished individual migration for ${table}.`);
        }
      }
    }

    console.log("\nFull database data migration completed successfully!");
  } catch (error: any) {
    console.error("Migration failed:", error.message || error);
    if (error.code) console.error("Error code:", error.code);
    if (error.meta) console.error("Meta:", error.meta);
  } finally {
    await oldPrisma.$disconnect();
    await newPrisma.$disconnect();
    await oldPool.end();
    await newPool.end();
  }
}

migrateData();
