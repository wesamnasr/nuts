"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { Prisma } from "@prisma/client";

export type LandingPageConfig = {
  id: string;
  heroTitleAr: string;
  heroTitleEn: string;
  heroSubtitleAr: string;
  heroSubtitleEn: string;
  heroImage: string;
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

const DEFAULT_CONFIG = {
  heroTitleAr: "اكتشف سحر الأثاث الكلاسيكي",
  heroTitleEn: "Rediscover the Charm of Vintage Living",
  heroSubtitleAr: "قطع مصنوعة يدوياً تضفي الدفء والأناقة على منزلك العصري.",
  heroSubtitleEn:
    "Handcrafted pieces that bring warmth and elegance to your modern home.",
  heroImage:
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=80",
  heroButtonTextAr: "تسوق المجموعة",
  heroButtonTextEn: "Shop Collection",
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
  flashSaleDiscount: 0,
  flashSaleEndDate: null,
};

export async function getLandingConfig(): Promise<LandingPageConfig> {
  try {
    const configs = await prisma.landingPageConfig.findMany({
      orderBy: { updatedAt: "desc" },
    });

    if (configs.length === 0) {
      // Create default config if none exists
      const created = await prisma.landingPageConfig.create({
        data: DEFAULT_CONFIG as unknown as Prisma.LandingPageConfigCreateInput,
      });
      return created as unknown as LandingPageConfig;
    }

    // Cleanup: If more than one exists, keep the latest and delete others
    if (configs.length > 1) {
      const idsToDelete = configs.slice(1).map((c) => c.id);
      await prisma.landingPageConfig.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }

    const config = configs[0];

    // Ensure all default sections are present in the order (for handling new sections added later)
    let currentOrder =
      (config.sectionsOrder as string[]) || DEFAULT_SECTIONS_ORDER;
    const missingSections = DEFAULT_SECTIONS_ORDER.filter(
      (section) => !currentOrder.includes(section),
    );

    if (missingSections.length > 0) {
      currentOrder = [...currentOrder, ...missingSections];
    }

    return {
      ...DEFAULT_CONFIG,
      ...config,
      sectionsOrder: currentOrder,
      flashSaleDiscount: config.flashSaleDiscount
        ? Number(config.flashSaleDiscount)
        : 0,
      manualNewArrivalIds: Array.from(
        new Set(config.manualNewArrivalIds || []),
      ),
      manualBestSellerIds: Array.from(
        new Set(config.manualBestSellerIds || []),
      ),
      manualFlashSaleIds: Array.from(new Set(config.manualFlashSaleIds || [])),
    } as unknown as LandingPageConfig;
  } catch (error) {
    console.error("Error fetching LandingPageConfig:", error);
    throw error;
  }
}

export async function updateLandingConfig(data: Partial<LandingPageConfig>) {
  try {
    // Deduplicate IDs before saving
    if (data.manualNewArrivalIds) {
      data.manualNewArrivalIds = Array.from(new Set(data.manualNewArrivalIds));
    }
    if (data.manualBestSellerIds) {
      data.manualBestSellerIds = Array.from(new Set(data.manualBestSellerIds));
    }
    if (data.manualFlashSaleIds) {
      data.manualFlashSaleIds = Array.from(new Set(data.manualFlashSaleIds));
    }

    const configs = await prisma.landingPageConfig.findMany({
      orderBy: { updatedAt: "desc" },
    });

    if (configs.length > 0) {
      const latest = configs[0];
      await prisma.landingPageConfig.update({
        where: { id: latest.id },
        data: data as unknown as Prisma.LandingPageConfigUpdateInput,
      });

      // Cleanup extras if any
      if (configs.length > 1) {
        const idsToDelete = configs.slice(1).map((c) => c.id);
        await prisma.landingPageConfig.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }
    } else {
      await prisma.landingPageConfig.create({
        data: {
          ...DEFAULT_CONFIG,
          ...data,
        } as unknown as Prisma.LandingPageConfigCreateInput,
      });
    }

    // Comprehensive revalidation
    revalidatePath("/", "layout");
    revalidatePath("/(dashboard)/admin/landing", "page");

    return { success: true };
  } catch (error) {
    console.error("Error updating landing config:", error);
    throw error;
  }
}
export async function uploadHeroImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    // Get current config to delete old image if it's on Vercel
    const config = await getLandingConfig();
    if (config.heroImage.includes("blob.vercel-storage.com")) {
      try {
        await del(config.heroImage);
      } catch (e) {
        console.error("Failed to delete old hero image:", e);
      }
    }

    const blob = await put(`landing/hero/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return { success: true, url: blob.url };
  } catch (error) {
    console.error("Error uploading hero image:", error);
    return { success: false, error: "Upload failed" };
  }
}
