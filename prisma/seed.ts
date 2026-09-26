import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

// تحميل المتغيرات البيئية إن وجدت
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

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.log("⚠️ No DATABASE_URL found. Please configure your .env file.");
  process.exit(0);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("🌱 Starting Nuts & Gourmet Food Store Seed...");

  try {
    // 1. إضافة مناطق الشحن لمحافظات مصر
    console.log("📦 Seeding Egyptian Shipping Zones...");
    const shippingZones = [
      {
        governorateAr: "القاهرة والجيزة",
        governorateEn: "Cairo & Giza",
        shippingFee: 50.0,
        estimatedDaysAr: "خلال 24 ساعة",
        estimatedDaysEn: "Within 24 Hours",
      },
      {
        governorateAr: "الإسكندرية والبحيرة",
        governorateEn: "Alexandria & Beheira",
        shippingFee: 65.0,
        estimatedDaysAr: "1 - 2 يوم عمل",
        estimatedDaysEn: "1 - 2 Business Days",
      },
      {
        governorateAr: "محافظات الدلتا والقناة",
        governorateEn: "Delta & Canal Cities",
        shippingFee: 70.0,
        estimatedDaysAr: "2 - 3 أيام عمل",
        estimatedDaysEn: "2 - 3 Business Days",
      },
      {
        governorateAr: "محافظات شمال ووسط الصعيد",
        governorateEn: "Upper Egypt (North & Central)",
        shippingFee: 85.0,
        estimatedDaysAr: "2 - 4 أيام عمل",
        estimatedDaysEn: "2 - 4 Business Days",
      },
      {
        governorateAr: "محافظات جنوب الصعيد والبحر الأحمر والحدودية",
        governorateEn: "South Upper Egypt & Frontier",
        shippingFee: 110.0,
        estimatedDaysAr: "3 - 5 أيام عمل",
        estimatedDaysEn: "3 - 5 Business Days",
      },
    ];

    for (const zone of shippingZones) {
      await prisma.shippingZone.create({ data: zone });
    }

    // 2. تصنيفات المكسرات والأغذية
    console.log("🥜 Seeding Categories...");
    const categoriesData = [
      {
        nameAr: "مكسرات محمصة",
        nameEn: "Roasted Nuts",
        slug: "roasted-nuts",
        descriptionAr: "مكسرات طازجة محمصة يومياً بأعلى درجات العناية ونكهات فريدة مقرمشة",
        descriptionEn: "Daily freshly roasted nuts with premium crispiness and unique flavors",
        image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80",
        sortOrder: 1,
      },
      {
        nameAr: "مكسرات نيئة وصحية",
        nameEn: "Raw & Healthy Nuts",
        slug: "raw-nuts",
        descriptionAr: "مكسرات طبيعية غير محمصة 100% غنية بالزيوت الصحية ومناسبة للكيتو",
        descriptionEn: "100% Natural raw unroasted nuts rich in healthy fats, keto-friendly",
        image: "https://images.unsplash.com/photo-1536591375661-bc9514e861d8?auto=format&fit=crop&w=800&q=80",
        sortOrder: 2,
      },
      {
        nameAr: "فواكه مجففة وياميش",
        nameEn: "Dried Fruits",
        slug: "dried-fruits",
        descriptionAr: "أجود أنواع التين والمشمش والقراصيا والزبيب الفاخر بدون سكر مضاف",
        descriptionEn: "Finest quality dried figs, apricots, prunes, and raisins with no added sugar",
        image: "https://images.unsplash.com/photo-1608755728617-aefab37d45f6?auto=format&fit=crop&w=800&q=80",
        sortOrder: 3,
      },
      {
        nameAr: "بوكسات مشكلة وهدايا",
        nameEn: "Gift Boxes & Mixes",
        slug: "gift-boxes",
        descriptionAr: "تشكيلات فاخرة منتقاة بعناية لجميع المناسبات في عبوات أنيقة",
        descriptionEn: "Carefully curated premium assortments in elegant gift packaging",
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
        sortOrder: 4,
      },
    ];

    const createdCategories: Record<string, string> = {};
    for (const cat of categoriesData) {
      const created = await prisma.category.create({ data: cat });
      createdCategories[cat.slug] = created.id;
    }

    // 3. منتجات نموذجية وأوزانها
    console.log("🌰 Seeding Sample Products & Variants...");
    const products = [
      {
        categoryId: createdCategories["roasted-nuts"],
        nameAr: "كاجو محمص جامبو فاخر",
        nameEn: "Premium Jumbo Roasted Cashews",
        slug: "premium-jumbo-cashews",
        descAr: "حبات كاجو جامبو منتقاة بعناية، محمصة ومملحة خفيف للحفاظ على الطعم الأصلي والمقرمش",
        descEn: "Carefully selected jumbo cashews, lightly roasted and salted for perfect crunch",
        originCountryAr: "فيتنامي",
        originCountryEn: "Vietnam",
        roastTypeAr: "محمص ومملح خفيف",
        roastTypeEn: "Lightly Salted",
        caloriesPer100g: 553,
        proteinPer100g: 18.2,
        isKeto: true,
        isFeatured: true,
        isBestSeller: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80",
            isMain: true,
          },
        ],
        variants: [
          {
            weightGram: 250,
            flavorAr: "مملح خفيف",
            packageTypeAr: "كيس محكم الغلق (Zipper)",
            price: 180.0,
            stockQuantity: 40,
            isDefault: true,
          },
          {
            weightGram: 500,
            flavorAr: "مملح خفيف",
            packageTypeAr: "كيس محكم الغلق (Zipper)",
            price: 340.0,
            discountPrice: 320.0,
            stockQuantity: 25,
            isDefault: false,
          },
          {
            weightGram: 1000,
            flavorAr: "مملح خفيف",
            packageTypeAr: "برطمان فاخر محكم الغلق",
            price: 660.0,
            discountPrice: 620.0,
            stockQuantity: 15,
            isDefault: false,
          },
        ],
      },
      {
        categoryId: createdCategories["roasted-nuts"],
        nameAr: "فستق أمريكي محمص ومملح",
        nameEn: "Roasted & Salted American Pistachios",
        slug: "roasted-american-pistachios",
        descAr: "فستق أمريكي درجة أولى مفتوح طبيعياً، محمص بالملح البحري الخفيف",
        descEn: "Grade-A naturally opened California pistachios roasted with light sea salt",
        originCountryAr: "أمريكا (كاليفورنيا)",
        originCountryEn: "USA (California)",
        roastTypeAr: "محمص بالملح البحري",
        roastTypeEn: "Sea Salt Roasted",
        caloriesPer100g: 562,
        proteinPer100g: 20.0,
        isKeto: true,
        isFeatured: true,
        isBestSeller: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=800&q=80",
            isMain: true,
          },
        ],
        variants: [
          {
            weightGram: 250,
            flavorAr: "ملح بحري",
            packageTypeAr: "كيس محكم الغلق (Zipper)",
            price: 210.0,
            stockQuantity: 30,
            isDefault: true,
          },
          {
            weightGram: 500,
            flavorAr: "ملح بحري",
            packageTypeAr: "كيس محكم الغلق (Zipper)",
            price: 400.0,
            discountPrice: 380.0,
            stockQuantity: 20,
            isDefault: false,
          },
        ],
      },
      {
        categoryId: createdCategories["raw-nuts"],
        nameAr: "عين جمل تشيلي نيء (أنصاف إكسترا)",
        nameEn: "Raw Chilean Walnut Halves",
        slug: "raw-chilean-walnuts",
        descAr: "عين جمل تشيلي فاتح اللون طازج وغني بأوميجا 3، غير محمص ومناسب تماماً للحميات والكيتو",
        descEn: "Fresh extra light Chilean walnuts, rich in Omega-3, raw and keto-friendly",
        originCountryAr: "تشيلي",
        originCountryEn: "Chile",
        roastTypeAr: "نيء (طبيعي 100%)",
        roastTypeEn: "Raw",
        caloriesPer100g: 654,
        proteinPer100g: 15.2,
        isKeto: true,
        isRaw: true,
        isFeatured: true,
        images: [
          {
            url: "https://images.unsplash.com/photo-1536591375661-bc9514e861d8?auto=format&fit=crop&w=800&q=80",
            isMain: true,
          },
        ],
        variants: [
          {
            weightGram: 250,
            flavorAr: "طبيعي خام",
            packageTypeAr: "كيس مفرغ من الهواء (Vacuum)",
            price: 150.0,
            stockQuantity: 50,
            isDefault: true,
          },
          {
            weightGram: 500,
            flavorAr: "طبيعي خام",
            packageTypeAr: "كيس مفرغ من الهواء (Vacuum)",
            price: 285.0,
            stockQuantity: 35,
            isDefault: false,
          },
        ],
      },
    ];

    for (const prod of products) {
      const { variants, images, ...prodData } = prod;
      const createdProd = await prisma.product.create({
        data: prodData,
      });

      for (const img of images) {
        await prisma.productImage.create({
          data: {
            productId: createdProd.id,
            url: img.url,
            isMain: img.isMain,
          },
        });
      }

      for (const v of variants) {
        await prisma.productVariant.create({
          data: {
            productId: createdProd.id,
            ...v,
          },
        });
      }
    }

    // 4. مميزات المتجر
    console.log("✨ Seeding Store Features...");
    const features = [
      {
        titleAr: "تحميص طازج يومياً",
        titleEn: "Daily Fresh Roasted",
        descAr: "نحمص مكسراتنا يومياً بأفران هوائية حديثة لضمان أقصى قرمشة وطعم أصيل",
        descEn: "Roasted daily using modern air roasters for maximum crunch and natural flavor",
        icon: "Flame",
        sortOrder: 1,
      },
      {
        titleAr: "تغليف محكم مفرغ من الهواء",
        titleEn: "Vacuum Sealed Packaging",
        descAr: "عبوات مفرغة لحفظ الزيوت الطبيعية والمذاق الطازج حتى وصولها لباب منزلك",
        descEn: "Sealed packaging protecting natural oils and fresh taste to your doorstep",
        icon: "ShieldCheck",
        sortOrder: 2,
      },
      {
        titleAr: "دفع مصري متعدد وآمن",
        titleEn: "All Egyptian Payments",
        descAr: "فودافون كاش، إنستاباي، ميزة، فيزا، فوري، والدفع عند الاستلام",
        descEn: "Vodafone Cash, InstaPay, Meeza cards, Fawry, and Cash on Delivery",
        icon: "CreditCard",
        sortOrder: 3,
      },
      {
        titleAr: "شحن سريع لجميع المحافظات",
        titleEn: "Fast Egypt-wide Delivery",
        descAr: "توصيل خلال 24 ساعة للقاهرة والجيزة، وتغطية كاملة لجميع محافظات مصر",
        descEn: "24-hour delivery in Cairo & Giza with complete coverage across Egypt",
        icon: "Truck",
        sortOrder: 4,
      },
    ];

    for (const feat of features) {
      await prisma.storeFeature.create({ data: feat });
    }

    // 5. إعدادات المتجر المصرية
    console.log("⚙️ Seeding Store Settings...");
    const settings = [
      { key: "storeNameAr", value: "محامص ومكسرات نَتس" },
      { key: "storeNameEn", value: "Nuts Gourmet Roastery" },
      { key: "currencyAr", value: "ج.م" },
      { key: "currencyEn", value: "EGP" },
      { key: "customerSupportNumber", value: "01000000000" },
      { key: "whatsappNumber", value: "201000000000" },
      { key: "instapayAddress", value: "nuts.roastery@instapay" },
      { key: "vodafoneCashNumber", value: "01000000000" },
      { key: "storeAddressAr", value: "القاهرة، جمهورية مصر العربية" },
      { key: "storeAddressEn", value: "Cairo, Egypt" },
      { key: "metaTitle", value: "محامص نَتس | أجود أنواع المكسرات والفواكه المجففة" },
      { key: "metaDescription", value: "تسوق أجود أنواع المكسرات المحمصة والنيئة والفواكه المجففة في مصر مع توصيل سريع لجميع المحافظات والدفع بفودافون كاش وإنستاباي" },
    ];

    for (const s of settings) {
      await prisma.setting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: s,
      });
    }

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
