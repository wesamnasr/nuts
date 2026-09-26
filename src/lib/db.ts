import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

// ضمان تحميل ملف .env عند تشغيل أي سكريبت بشكل مستقل
if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!;

const globalForDB = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  adapter: PrismaPg | undefined;
};

if (!globalForDB.pool) {
  globalForDB.pool = new Pool({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    ssl: { rejectUnauthorized: false },
  });
}

if (!globalForDB.adapter) {
  globalForDB.adapter = new PrismaPg(globalForDB.pool);
}

export const prisma =
  globalForDB.prisma ?? new PrismaClient({ adapter: globalForDB.adapter });

if (process.env.NODE_ENV !== "production") {
  globalForDB.prisma = prisma;
}
