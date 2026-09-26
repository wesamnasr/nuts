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
  storeNameEn: "New Concept",
  storeNameAr: "نيو كونسبت",
  customerSupportNumber: "+966500000000",
  salesNumber: "+966500000000",
  // Legacy support (will be migrated)
  whatsappNumber: "+966500000000",
  logoUrl: "",
  installmentInfoEn: "",
  installmentInfoAr: "",
  metaTitle: "New Concept",
  metaDescription: "Modern Furniture & Decor | أثاث وديكور عصري",
  instagramUrl: "https://www.instagram.com/nconcept_furniture",
  tiktokUrl: "https://www.tiktok.com/@newconcep",
  snapchatUrl: "https://www.snapchat.com/add/new_concept24",
  facebookUrl: "https://www.facebook.com/100078741371543",
  whatsappUrl: "https://wa.me/966570581224",
  googleMapsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=21.484635, 39.186066",
  mapCoordinates: "21.484635, 39.186066",
  storeAddressEn: "Al Makarunah St, Ar Rabwah, Jeddah, Saudi Arabia",
  storeAddressAr: "شارع المكرونة، حي الربوة، جدة، المملكة العربية السعودية",
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

// --------------------------------------------------
// GET: Policies (Cached)
// --------------------------------------------------
export async function getPolicies(): Promise<PolicyData[]> {
  return unstable_cache(
    async () => {
      const policies = await prisma.policy.findMany({
        orderBy: { type: "asc" },
      });

      // Seed defaults if empty
      if (policies.length === 0) {
        const defaults = [
          {
            type: "SHIPPING" as const,
            contentEn: "Free shipping on orders over 5000 EGP.",
            contentAr: "شحن مجاني للطلبات فوق 5000 جنيه.",
          },
          {
            type: "RETURN" as const,
            contentEn: "Returns accepted within 14 days.",
            contentAr: "يمكن الاسترجاع خلال 14 يوم.",
          },
          {
            type: "INSTALLATION" as const,
            contentEn: "Free installation within Cairo.",
            contentAr: "تركيب مجاني داخل القاهرة.",
          },
        ];
        const created = await prisma.$transaction(
          defaults.map((d) =>
            prisma.policy.upsert({
              where: { type: d.type },
              update: {},
              create: d,
            }),
          ),
        );
        return created.map((p) => ({
          id: p.id,
          type: p.type,
          contentAr: p.contentAr,
          contentEn: p.contentEn,
        }));
      }

      return policies.map((p) => ({
        id: p.id,
        type: p.type,
        contentAr: p.contentAr,
        contentEn: p.contentEn,
      }));
    },
    ["store-policies"],
    { revalidate: 3600, tags: ["policies"] },
  )();
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
    await prisma.policy.upsert({
      where: { type },
      update: { contentEn, contentAr },
      create: { type, contentEn, contentAr },
    });

    revalidateTag("policies", "max");
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
