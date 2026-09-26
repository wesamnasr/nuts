
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = "postgresql://neondb_owner:npg_r2cgRzv0LakU@ep-shy-wave-amoe9o6p-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=verify-full";

const pool = new Pool({
  connectionString,
  max: 10,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkStock() {
  const productId = '5108aa32-3955-4e7f-a6ea-5607ac4efebd';
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });
    console.log('Product Name:', product.nameEn);
    product.variants.forEach(v => {
      console.log(`Variant ${v.id} (Default: ${v.isDefault}): Stock = ${v.stock}`);
    });
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkStock();
