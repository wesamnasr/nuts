import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;

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
