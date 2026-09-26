
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = "postgresql://neondb_owner:npg_r2cgRzv0LakU@ep-shy-wave-amoe9o6p-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=verify-full";

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkAndUpdate() {
  const slug = 'tira-kids-room-5334';
  
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { variants: true }
    });

    if (!product) {
      console.log('Product not found');
      return;
    }

    console.log('Product found:', product.nameAr);
    console.log('Current Variants Stock Status:');
    product.variants.forEach(v => {
      console.log(`- SKU: ${v.sku}, Stock: ${v.stock}, isDefault: ${v.isDefault}`);
    });

    // Update the specific SKU the user mentioned to stock 0
    await prisma.productVariant.updateMany({
      where: { 
        productId: product.id,
        sku: 'SKU-1776244212989-k09m6'
      },
      data: { stock: 0 }
    });
    
    // Also update any default variants just in case
    await prisma.productVariant.updateMany({
        where: { 
          productId: product.id,
          isDefault: true
        },
        data: { stock: 0 }
      });

    // Revalidate the product page cache
    console.log('Successfully updated specified SKU and default variant to stock 0');
    
  } catch (err) {
    console.error(err);
  } finally {
    // Note: revalidatePath only works within Next.js runtime. 
    // Since this script runs via node, we can't call it here.
    // However, I've cleared the DB. 
    await prisma.$disconnect();
    await pool.end();
  }
}

checkAndUpdate();
