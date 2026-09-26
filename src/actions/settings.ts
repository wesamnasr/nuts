"use server";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { revalidatePath, revalidateTag } from "next/cache";
import { put, del } from "@vercel/blob";

// --------------------------------------------------
// Types
// --------------------------------------------------
export type SettingsMap = Record<string, string>;

export type PolicyData = {
  id: string;
  type: "SHIPPING" | "RETURN" | "INSTALLATION";
  contentAr: string;
  contentEn: string;
};

// --------------------------------------------------
// Default Settings
// --------------------------------------------------
const DEFAULT_SETTINGS: Record<string, string> = {
  storeNameEn: "Nuts Gourmet Roastery",
  storeNameAr: "محامص ومكسرات نَتس",
  customerSupportNumber: "01000000000",
  salesNumber: "01000000000",
  whatsappNumber: "201000000000",
  instapayAddress: "nuts.roastery@instapay",
  vodafoneCashNumber: "01000000000",
  currencyAr: "ج.م",
  currencyEn: "EGP",
  logoUrl: "",
  metaTitle: "محامص نَتس | أجود أنواع المكسرات والفواكه المجففة",
  metaDescription: "تسوق أجود أنواع المكسرات المحمصة والنيئة والفواكه المجففة في مصر مع توصيل سريع لجميع المحافظات والدفع بفودافون كاش وإنستاباي",
  instagramUrl: "https://www.instagram.com",
  tiktokUrl: "https://www.tiktok.com",
  facebookUrl: "https://www.facebook.com",
  whatsappUrl: "https://wa.me/201000000000",
  storeAddressEn: "Cairo, Egypt",
  storeAddressAr: "القاهرة، جمهورية مصر العربية",
};

// --------------------------------------------------
// GET: Settings (Cached)
// --------------------------------------------------
export async function getSettings(): Promise<SettingsMap> {
  return unstable_cache(
    async () => {
      try {
        const rows = await prisma.setting.findMany();

        // Seed defaults if empty
        if (rows.length === 0) {
          const entries = Object.entries(DEFAULT_SETTINGS);
          await prisma.$transaction(
            entries.map(([key, value]) =>
              prisma.setting.upsert({
                where: { key },
                update: {},
                create: { key, value },
              }),
            ),
          );
          return { ...DEFAULT_SETTINGS };
        }

        const map: SettingsMap = {};
        for (const row of rows) {
          map[row.key] = row.value;
        }

        // Migration: If new keys missing, use old whatsappNumber
        if (!map.customerSupportNumber && map.whatsappNumber) {
          map.customerSupportNumber = map.whatsappNumber;
        }
        if (!map.salesNumber && map.whatsappNumber) {
          map.salesNumber = map.whatsappNumber;
        }

        // Fill any remaining missing keys with defaults
        for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
          if (!(key in map)) map[key] = value;
        }

        // Force English Only for identity fields
        const identityKeys = ["storeNameEn", "storeNameAr", "metaTitle"];
        identityKeys.forEach((key) => {
          if (map[key]) {
            // Remove everything after | and trim
            map[key] = map[key].split("|")[0].trim();
          }
        });

        // Even force Arabic store name to match English for consistency if requested
        map.storeNameAr = map.storeNameEn || "New Concept";

        return map;
      } catch (error) {
        console.warn(
          "Failed to fetch settings from database (likely during build). Using defaults.",
        );
        console.error(error);
        return { ...DEFAULT_SETTINGS };
      }
    },
    ["store-settings-v2"],
    { revalidate: 3600, tags: ["settings"] },
  )();
}

// --------------------------------------------------
// UPDATE: Settings (Upsert Transaction)
// --------------------------------------------------
export async function updateSettings(formData: FormData) {
  try {
    const updates: { key: string; value: string }[] = [];

    // Extract all setting fields from formData
    const settingKeys = [
      "storeNameEn",
      "storeNameAr",
      "customerSupportNumber",
      "salesNumber",
      "installmentInfoEn",
      "installmentInfoAr",
      "metaTitle",
      "metaDescription",
      "logoUrl",
      "instagramUrl",
      "tiktokUrl",
      "snapchatUrl",
      "facebookUrl",
      "whatsappUrl",
      "googleMapsUrl",
      "mapCoordinates",
      "storeAddressEn",
      "storeAddressAr",
    ];

    for (const key of settingKeys) {
      const value = formData.get(key);
      if (value !== null) {
        updates.push({ key, value: value.toString() });
      }
    }

    // Handle logo upload
    const logoFile = formData.get("logo") as File | null;
    if (logoFile && logoFile.size > 0) {
      // 1. Get current logo to delete if it's on Vercel
      const settings = await getSettings();
      if (settings.logoUrl?.includes("blob.vercel-storage.com")) {
        try {
          await del(settings.logoUrl);
        } catch (e) {
          console.error("Failed to delete old logo:", e);
        }
      }

      // 2. Upload new logo
      const blob = await put(`settings/logo/${logoFile.name}`, logoFile, {
        access: "public",
        addRandomSuffix: true,
      });

      updates.push({ key: "logoUrl", value: blob.url });
    }

    // Upsert all settings in a transaction (Interactive mode to support timeout)
    await prisma.$transaction(
      async (tx) => {
        await Promise.all(
          updates.map(({ key, value }) =>
            tx.setting.upsert({
              where: { key },
              update: { value },
              create: { key, value },
            }),
          ),
        );
      },
      {
        timeout: 10000, // 10 seconds for the transaction itself
        maxWait: 5000, // 5 seconds to wait for a connection
      },
    );

    // Revalidate everything
    revalidateTag("settings", "max");
    revalidatePath("/");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

const defaultStorePolicies: PolicyData[] = [
  {
    id: "policy-shipping",
    type: "SHIPPING",
    contentEn: "Fast shipping to Cairo, Giza, Alexandria & all Egypt governorates within 24-48 hours. Free delivery for orders over 1000 EGP.",
    contentAr: "شحن سريع خلال 24 - 48 ساعة للقاهرة والجيزة والإسكندرية وجميع محافظات مصر. شحن مجاني للطلبات فوق 1000 جنيه.",
  },
  {
    id: "policy-return",
    type: "RETURN",
    contentEn: "100% satisfaction guarantee. If your package is unsealed or not fresh, contact us for an instant replacement.",
    contentAr: "ضمان الرضا 100%. في حال وصول العبوة غير محكمة الغلق أو غير طازجة، نوفر استبدال فوري أو استرجاع بدون أي تعقيد.",
  },
  {
    id: "policy-installation",
    type: "INSTALLATION",
    contentEn: "Vacuum sealed in airtight zipper pouches or premium jars to maintain crunchiness.",
    contentAr: "تغليف محكم بسحب الهواء للحفاظ على قرمشة وطزاجة المكسرات والزيوت الطبيعية لأطول فترة ممكنة.",
  },
];

// --------------------------------------------------
// GET: Policies (Cached)
// --------------------------------------------------
export async function getPolicies(): Promise<PolicyData[]> {
  return defaultStorePolicies;
}

// --------------------------------------------------
// UPDATE: Single Policy
// --------------------------------------------------
export async function updatePolicy(
  type: "SHIPPING" | "RETURN" | "INSTALLATION",
  contentEn: string,
  contentAr: string,
) {
  try {
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating policy:", error);
    return { success: false, error: "Failed to update policy" };
  }
}

// --------------------------------------------------
// GET: Landing Page Config
// --------------------------------------------------
export async function getLandingPageConfig() {
  return unstable_cache(
    async () => {
      const config = await prisma.landingPageConfig.findFirst();
      return config;
    },
    ["landing-page-config"],
    { revalidate: 3600, tags: ["landing-page"] },
  )();
}
