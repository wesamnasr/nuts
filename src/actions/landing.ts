"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { BLOB_TOKEN } from "@/lib/blob";

export type LandingPageConfig = {
  id?: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroImage: string | null;
  heroButtonTextAr: string;
  heroButtonTextEn: string;
  heroLink: string;

  showHero: boolean;
  showFeatures: boolean;
  showNewArrivals: boolean;
  showBestSellers: boolean;
  showFlashSales: boolean;
  showCategories: boolean;
  showTestimonials: boolean;
  showCustomerPhotos: boolean;
  showNewsletter: boolean;

  sectionsOrder: string[] | null;
  manualNewArrivalIds: string[];
  manualBestSellerIds: string[];
  manualFlashSaleIds: string[];
  manualFlashSaleId: string | null;
  flashSaleDiscount: number | null;
  flashSaleEndDate: Date | null;
};

const DEFAULT_SECTIONS_ORDER = [
  "hero",
  "categories",
  "new_arrivals",
  "best_sellers",
  "flash_sale",
  "testimonials",
  "customer_photos",
  "features",
  "newsletter",
];

const DEFAULT_CONFIG: LandingPageConfig = {
  heroTitleAr: "أجود أنواع المكسرات الفاخرة والطازجة",
  heroTitleEn: "Premium Fresh & Roasted Gourmet Nuts",
  heroSubtitleAr: "محمصة بعناية يومياً، بجودة طبيعية 100% ونكهات فريدة للضيافة والأسرة",
  heroSubtitleEn: "Carefully roasted daily with 100% natural quality and unique flavors",
  heroImage: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=2000&q=80",
  heroButtonTextAr: "تسوق الآن",
  heroButtonTextEn: "Shop Now",
  heroLink: "/shop",

  showHero: true,
  showFeatures: true,
  showNewArrivals: true,
  showBestSellers: true,
  showFlashSales: true,
  showCategories: true,
  showTestimonials: true,
  showCustomerPhotos: true,
  showNewsletter: true,

  sectionsOrder: DEFAULT_SECTIONS_ORDER,
  manualNewArrivalIds: [],
  manualBestSellerIds: [],
  manualFlashSaleIds: [],
  manualFlashSaleId: null,
  flashSaleDiscount: 15,
  flashSaleEndDate: null,
};

const DB_DEFAULT_CREATE: Prisma.LandingPageConfigCreateInput = {
  heroTitleAr: DEFAULT_CONFIG.heroTitleAr,
  heroTitleEn: DEFAULT_CONFIG.heroTitleEn,
  heroSubtitleAr: DEFAULT_CONFIG.heroSubtitleAr,
  heroSubtitleEn: DEFAULT_CONFIG.heroSubtitleEn,
  heroImage: DEFAULT_CONFIG.heroImage,
  heroButtonTextAr: DEFAULT_CONFIG.heroButtonTextAr,
  heroButtonTextEn: DEFAULT_CONFIG.heroButtonTextEn,
  heroLink: DEFAULT_CONFIG.heroLink,
  showHero: DEFAULT_CONFIG.showHero,
  showFeatures: DEFAULT_CONFIG.showFeatures,
  showNewArrivals: DEFAULT_CONFIG.showNewArrivals,
  showBestSellers: DEFAULT_CONFIG.showBestSellers,
  showFlashSales: DEFAULT_CONFIG.showFlashSales,
  showCategories: DEFAULT_CONFIG.showCategories,
  showTestimonials: DEFAULT_CONFIG.showTestimonials,
  flashSaleDiscount: DEFAULT_CONFIG.flashSaleDiscount,
};

export async function getLandingConfig(): Promise<LandingPageConfig> {
  try {
    const configs = await prisma.landingPageConfig.findMany({
      orderBy: { updatedAt: "desc" },
    });

    if (configs.length === 0) {
      const created = await prisma.landingPageConfig.create({
        data: DB_DEFAULT_CREATE,
      });
      return {
        ...DEFAULT_CONFIG,
        ...created,
        sectionsOrder: DEFAULT_SECTIONS_ORDER,
        manualNewArrivalIds: [],
        manualBestSellerIds: [],
        manualFlashSaleIds: [],
      } as LandingPageConfig;
    }

    const config: any = configs[0];

    return {
      ...DEFAULT_CONFIG,
      ...config,
      sectionsOrder: DEFAULT_SECTIONS_ORDER,
      flashSaleDiscount: config.flashSaleDiscount ? Number(config.flashSaleDiscount) : 15,
      manualNewArrivalIds: [],
      manualBestSellerIds: [],
      manualFlashSaleIds: [],
    } as LandingPageConfig;
  } catch (error) {
    console.error("Error fetching LandingPageConfig:", error);
    return DEFAULT_CONFIG;
  }
}

export async function updateLandingConfig(data: Partial<LandingPageConfig>) {
  try {
    const configs = await prisma.landingPageConfig.findMany({
      orderBy: { updatedAt: "desc" },
    });

    const dbData: Record<string, any> = {};
    if (data.heroTitleAr !== undefined) dbData.heroTitleAr = data.heroTitleAr;
    if (data.heroTitleEn !== undefined) dbData.heroTitleEn = data.heroTitleEn;
    if (data.heroSubtitleAr !== undefined) dbData.heroSubtitleAr = data.heroSubtitleAr;
    if (data.heroSubtitleEn !== undefined) dbData.heroSubtitleEn = data.heroSubtitleEn;
    if (data.heroImage !== undefined) dbData.heroImage = data.heroImage;
    if (data.heroButtonTextAr !== undefined) dbData.heroButtonTextAr = data.heroButtonTextAr;
    if (data.heroButtonTextEn !== undefined) dbData.heroButtonTextEn = data.heroButtonTextEn;
    if (data.heroLink !== undefined) dbData.heroLink = data.heroLink;
    if (data.showHero !== undefined) dbData.showHero = data.showHero;
    if (data.showFeatures !== undefined) dbData.showFeatures = data.showFeatures;
    if (data.showNewArrivals !== undefined) dbData.showNewArrivals = data.showNewArrivals;
    if (data.showBestSellers !== undefined) dbData.showBestSellers = data.showBestSellers;
    if (data.showFlashSales !== undefined) dbData.showFlashSales = data.showFlashSales;
    if (data.showCategories !== undefined) dbData.showCategories = data.showCategories;
    if (data.showTestimonials !== undefined) dbData.showTestimonials = data.showTestimonials;
    if (data.flashSaleDiscount !== undefined) dbData.flashSaleDiscount = data.flashSaleDiscount;
    if (data.flashSaleEndDate !== undefined) dbData.flashSaleEndDate = data.flashSaleEndDate;

    if (configs.length > 0) {
      await prisma.landingPageConfig.update({
        where: { id: configs[0].id },
        data: dbData,
      });
    } else {
      await prisma.landingPageConfig.create({
        data: {
          ...DB_DEFAULT_CREATE,
          ...dbData,
        },
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/landing", "page");

    return { success: true };
  } catch (error) {
    console.error("Error updating LandingPageConfig:", error);
    return { success: false, error: "Failed to update configuration" };
  }
}

export async function uploadHeroImage(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" };
    }

    if (!BLOB_TOKEN) {
      return {
        success: false,
        error: "Storage not configured (missing BLOB_READ_WRITE_TOKEN)",
      };
    }

    const blob = await put(`landing/hero/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      token: BLOB_TOKEN,
    });

    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Error uploading hero image:", error);
    return { success: false, error: "Failed to upload hero image" };
  }
}
