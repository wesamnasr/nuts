import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

// Manually load .env since dotenv is not available
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts
        .join("=")
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
}

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Updating store name to "New Concept"...');

  try {
    const updates = [
      { key: "storeNameEn", value: "New Concept" },
      { key: "storeNameAr", value: "New Concept" },
      { key: "metaTitle", value: "New Concept" },
      {
        key: "metaDescription",
        value: "Modern Furniture & Decor | أثاث وديكور عصري",
      },
    ];

    for (const update of updates) {
      await prisma.setting.upsert({
        where: { key: update.key },
        update: { value: update.value },
        create: { key: update.key, value: update.value },
      });
      console.log(`Updated ${update.key}`);
    }

    console.log("Store branding updated successfully.");
  } catch (error) {
    console.error("Error updating settings:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
