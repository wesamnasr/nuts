import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

// Manually load .env
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
  console.log("Updating Hero Image...");

  try {
    // New High Quality Image (luxury beige/warm living room)
    const newHeroImage =
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=90";

    const config = await prisma.landingPageConfig.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (config) {
      await prisma.landingPageConfig.update({
        where: { id: config.id },
        data: {
          heroImage: newHeroImage,
        },
      });
      console.log("Updated existing landing config with new hero image.");
    } else {
      // Should not happen usually if app checked
      console.log("No landing config found to update.");
    }
  } catch (error) {
    console.error("Error updating hero image:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
