import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL!;
const pool = new Pool({ 
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to generate random string
function randomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Helper to generate random number
function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Curated Unsplash Images for Furniture
const categoryImages: Record<string, string> = {
  "Living Room":
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
  Bedroom:
    "https://images.unsplash.com/photo-1505693416388-b0346efee539?auto=format&fit=crop&w=800&q=80",
  "Dining Room":
    "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
  Office:
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
  Outdoor:
    "https://images.unsplash.com/photo-1592613653195-207d50325d97?auto=format&fit=crop&w=800&q=80",
  Lighting:
    "https://images.unsplash.com/photo-1513506003011-3b03c860c1fb?auto=format&fit=crop&w=800&q=80",
  Decor:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
  Kitchen:
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
  Bathroom:
    "https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
  "Kids Room":
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80",
};

const productImagesList = [
  "https://images.unsplash.com/photo-1567538096630-e08558e0fcde?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
];

// Arabic/English Mock Data
const categories = [
  { en: "Living Room", ar: "غرفة المعيشة" },
  { en: "Bedroom", ar: "غرفة النوم" },
  { en: "Dining Room", ar: "غرفة الطعام" },
  { en: "Office", ar: "المكتب" },
  { en: "Outdoor", ar: "خارج المنزل" },
  { en: "Lighting", ar: "الإضاءة" },
  { en: "Decor", ar: "الديكور" },
  { en: "Kitchen", ar: "المطبخ" },
  { en: "Bathroom", ar: "الحمام" },
  { en: "Kids Room", ar: "غرفة الأطفال" },
];

const adjectivesEn = [
  "Modern",
  "Classic",
  "Premium",
  "Luxury",
  "Minimalist",
  "Cozy",
  "Elegant",
  "Rustic",
  "Vintage",
  "Sleek",
];
const adjectivesAr = [
  "عصري",
  "كلاسيكي",
  "فاخر",
  "فخم",
  "بسيط",
  "مريح",
  "أنيق",
  "ريفي",
  "قديم",
  "أملس",
];

const nounsEn = [
  "Sofa",
  "Chair",
  "Table",
  "Lamp",
  "Bed",
  "Desk",
  "Shelf",
  "Rug",
  "Mirror",
  "Cabinet",
];
const nounsAr = [
  "أريكة",
  "كرسي",
  "طاولة",
  "مصباح",
  "سرير",
  "مكتب",
  "رف",
  "سجادة",
  "مرآة",
  "خزانة",
];

const reviewsEn = [
  "Great product!",
  "Really loved it.",
  "Good quality.",
  "Fast delivery.",
  "Highly recommended.",
  "Nice design.",
  "Comfortable.",
  "Worth the price.",
  "Amazing.",
  "Perfect for my home.",
];
const reviewsAr = [
  "منتج رائع!",
  "أحببته حقًا.",
  "جودة جيدة.",
  "توصيل سريع.",
  "موصى به بشدة.",
  "تصميم جميل.",
  "مريح.",
  "يستحق السعر.",
  "مدهش.",
  "مثالي لمنزلي.",
];

const names = [
  "Ahmed",
  "Sara",
  "Mohamed",
  "Fatima",
  "Ali",
  "Noura",
  "Omar",
  "Layla",
  "Khalid",
  "Amal",
];

async function main() {
  console.log("Start seeding ...");

  // CLEANUP FIRST
  console.log("Cleaning existing data...");
  try {
    if (prisma.review) await prisma.review.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
  } catch (e) {
    console.log("Cleanup error (might be first run):", e);
  }

  const createdCategories = [];

  // 1. Create 10 Categories
  console.log("Seeding Categories...");
  for (let i = 0; i < 10; i++) {
    const catData = categories[i] || { en: `Category ${i}`, ar: `تصنيف ${i}` };
    const category = await prisma.category.create({
      data: {
        nameEn: catData.en,
        nameAr: catData.ar,
        slug: `${catData.en.toLowerCase().replace(/ /g, "-")}-${randomString(5)}`,
        sortOrder: i + 1,
        isActive: true,
        image:
          categoryImages[catData.en] ||
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      },
    });
    createdCategories.push(category);
    console.log(`Created category: ${category.nameEn}`);
  }

  // 2. Create products for each category
  console.log("Seeding Products...");
  const createdProductsPromise = [];

  for (const category of createdCategories) {
    for (let i = 0; i < 2; i++) {
      const idx = randomNumber(0, 9);
      const nameEn = `${adjectivesEn[idx]} ${nounsEn[idx]} ${randomString(3)}`;
      const nameAr = `${nounsAr[idx]} ${adjectivesAr[idx]} ${randomString(3)}`;

      const price = randomNumber(100, 5000);

      const mainImage =
        productImagesList[randomNumber(0, productImagesList.length - 1)];
      const secondaryImage =
        productImagesList[randomNumber(0, productImagesList.length - 1)];

      createdProductsPromise.push(
        prisma.product.create({
          data: {
            categoryId: category.id,
            nameEn: nameEn,
            nameAr: nameAr,
            descEn:
              "This is a high quality furniture piece that fits perfectly in your modern home. Made with premium materials.",
            descAr:
              "هذه قطعة أثاث عالية الجودة تناسب منزلك العصري تمامًا. مصنوعة من مواد ممتازة.",
            slug: `${nameEn.toLowerCase().replace(/ /g, "-")}-${randomString(5)}`,
            isVisible: true,
            isFeatured: Math.random() > 0.8,
            materialEn: "Wood & Fabric",
            materialAr: "خشب وقماش",
            madeInEn: "Turkey",
            madeInAr: "تركيا",
            warrantyEn: "2 Years",
            warrantyAr: "سنتين",
            images: {
              create: [
                {
                  url: mainImage,
                  sortOrder: 1,
                  isMain: true,
                },
                {
                  url: secondaryImage,
                  sortOrder: 2,
                  isMain: false,
                },
              ],
            },
            variants: {
              create: {
                price: price,
                stock: randomNumber(5, 50),
                sku: `SKU-${randomString(6).toUpperCase()}`,
                isDefault: true,
                sizeNameEn: "Standard",
                sizeNameAr: "قياسي",
                colorEn: "Beige",
                colorAr: "بيج",
              },
            },
          },
        }),
      );
    }
  }

  const createdProducts = await Promise.all(createdProductsPromise);
  createdProducts.forEach((p) => console.log(`Created product: ${p.nameEn}`));

  // 3. Create 10 Reviews
  console.log("Seeding Reviews...");
  // @ts-ignore
  if (prisma.review) {
    for (let i = 0; i < 10; i++) {
      if (createdProducts.length === 0) break;
      const product =
        createdProducts[randomNumber(0, createdProducts.length - 1)];
      const reviewIdx = randomNumber(0, 9);
      const nameIdx = randomNumber(0, 9);

      await prisma.review.create({
        data: {
          productId: product.id,
          customerName: names[nameIdx],
          rating: randomNumber(3, 5),
          comment: reviewsEn[reviewIdx],
          commentAr: reviewsAr[reviewIdx],
          commentEn: reviewsEn[reviewIdx],
          isApproved: true,
          isFeatured: Math.random() > 0.7,
          customerImage: `https://i.pravatar.cc/150?u=${randomString(5)}`,
        },
      });
      console.log(`Created review for ${product.nameEn}`);
    }
  } else {
    console.log("Skipping reviews seeding - Model Review not found");
  }

  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
