
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = "postgresql://neondb_owner:npg_r2cgRzv0LakU@ep-shy-wave-amoe9o6p-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=verify-full";

async function main() {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const product = await prisma.product.findUnique({
      where: { id: '5108aa32-3955-4e7f-a6ea-5607ac4efebd' },
      include: {
        variants: true,
        images: true,
        category: true
      }
    });
    console.log('PRODUCT_START');
    console.log(JSON.stringify(product, null, 2));
    console.log('PRODUCT_END');

    const categories = await prisma.category.findMany();
    console.log('CATEGORIES_START');
    console.log(JSON.stringify(categories, null, 2));
    console.log('CATEGORIES_END');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
