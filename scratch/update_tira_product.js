
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = "postgresql://neondb_owner:npg_r2cgRzv0LakU@ep-shy-wave-amoe9o6p-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=verify-full";

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function updateTiraProduct() {
  const productId = '5108aa32-3955-4e7f-a6ea-5607ac4efebd';

  const descAr = `مكونات الغرفة:
- سرير أطفال
- خزانة ملابس (دولاب) مفاصل
- 2 طاولات جانبية (كمودينو)
- تسريحة

المواد:
- مصنوعة من خشب تشيب بورد (Chipboard)
- مغطاة بطبقة ميلامين مقاومة للرطوبة والحرارة والسوائل والحشرات

الأبعاد:
- السرير: عرض 120 سم
- الدولاب: عرض 200 سم
- التسريحة: عرض 120 سم
- الكمودينو: عرض 50 سم

المقاسات المتوفرة للسرير: 100 سم / 120 سم`;

  const descEn = `Room Components:
- Kids Bed
- Hinged Wardrobe
- 2 Nightstands
- Dressing Table

Materials:
- Made of chipboard wood
- Finished with a melamine coating resistant to moisture, heat, liquids, and insects

Dimensions:
- Bed: 120 cm width
- Hinged Wardrobe: 200 cm width
- Dressing Table: 120 cm width
- Nightstand: 50 cm width

Available Sizes for Bed: 100 cm / 120 cm`;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        nameAr: 'غرفة اطفال تِيرا',
        nameEn: 'Tira Kids Room',
        descAr,
        descEn,
        materialAr: 'خشب تشيب بورد',
        materialEn: 'Chipboard Wood',
        madeInAr: 'المملكة العربية السعودية',
        madeInEn: 'Saudi Arabia',
        warrantyAr: '5 سنوات',
        warrantyEn: '5-Year',
        recommendedSize: '200x120',
        variants: {
          updateMany: {
            where: { isDefault: true },
            data: {
              price: 21997.00,
              discountPrice: null,
              showPrice: false, 
            }
          }
        }
      }
    });

    console.log('Successfully updated Tira Kids Room product');
    console.log('Updated Status:', updatedProduct.nameEn);
  } catch (error) {
    console.error('Error updating product:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

updateTiraProduct();
