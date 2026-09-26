import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL!;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const total = await prisma.product.count();
    const visible = await prisma.product.count({ where: { isVisible: true } });
    const active = await prisma.product.count({ where: { isDeleted: false } });
    const combined = await prisma.product.count({ where: { isVisible: true, isDeleted: false } });
    
    console.log("Product counts:", { total, visible, active, combined });
    
    if (combined === 0 && total > 0) {
        const sample = await prisma.product.findFirst();
        console.log("Sample product:", sample);
    }
  } catch (e) {
    console.error("Query failed:", e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
