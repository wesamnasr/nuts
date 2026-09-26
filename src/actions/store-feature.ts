"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";

export type StoreFeatureData = {
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon?: string;
  sortOrder?: number;
  isActive?: boolean;
};

// GET: Fetch all features (for admin)
export async function getStoreFeatures() {
  try {
    const features = await prisma.storeFeature.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return { success: true, data: features };
  } catch (error) {
    console.error("Error fetching store features:", error);
    return { success: false, error: "Failed to fetch store features" };
  }
}

// GET: Fetch active features (for frontend)
export async function getActiveStoreFeatures() {
  try {
    const features = await prisma.storeFeature.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return { success: true, data: features };
  } catch (error) {
    console.error("Error fetching active store features:", error);
    return { success: false, error: "Failed to fetch store features" };
  }
}

// CREATE: Create a new feature
export async function createStoreFeature(formData: FormData) {
  try {
    const titleAr = formData.get("titleAr") as string;
    const titleEn = formData.get("titleEn") as string;
    const descAr = formData.get("descAr") as string;
    const descEn = formData.get("descEn") as string;
    const sortOrder = Number(formData.get("sortOrder") || 0);
    const isActive = formData.get("isActive") === "true";
    const iconFile = formData.get("icon") as File | null;
    let iconUrl = "";

    if (iconFile && iconFile.size > 0) {
      const blob = await put(`features/${iconFile.name}`, iconFile, {
        access: "public",
        addRandomSuffix: true,
      });
      iconUrl = blob.url;
    } else {
      return { success: false, error: "Icon is required" };
    }

    const feature = await prisma.storeFeature.create({
      data: {
        titleAr,
        titleEn,
        descAr,
        descEn,
        icon: iconUrl,
        sortOrder,
        isActive,
      },
    });
    revalidatePath("/");
    revalidatePath("/admin/features");
    return { success: true, data: feature };
  } catch (error) {
    console.error("Error creating store feature:", error);
    return { success: false, error: "Failed to create store feature" };
  }
}

// UPDATE: Update an existing feature
export async function updateStoreFeature(id: string, formData: FormData) {
  try {
    const titleAr = formData.get("titleAr") as string;
    const titleEn = formData.get("titleEn") as string;
    const descAr = formData.get("descAr") as string;
    const descEn = formData.get("descEn") as string;
    const sortOrder = Number(formData.get("sortOrder") || 0);
    const isActive = formData.get("isActive") === "true";
    const iconFile = formData.get("icon") as File | null;

    const data: Partial<StoreFeatureData> = {
      titleAr,
      titleEn,
      descAr,
      descEn,
      sortOrder,
      isActive,
    };

    if (iconFile && iconFile.size > 0) {
      const blob = await put(`features/${iconFile.name}`, iconFile, {
        access: "public",
        addRandomSuffix: true,
      });
      data.icon = blob.url;
    }

    const feature = await prisma.storeFeature.update({
      where: { id },
      data,
    });
    revalidatePath("/");
    revalidatePath("/admin/features");
    return { success: true, data: feature };
  } catch (error) {
    console.error("Error updating store feature:", error);
    return { success: false, error: "Failed to update store feature" };
  }
}

// DELETE: Delete a feature
export async function deleteStoreFeature(id: string) {
  try {
    const feature = await prisma.storeFeature.findUnique({
      where: { id },
    });
    if (feature?.icon?.includes("blob.vercel-storage.com")) {
      await del(feature.icon);
    }
    await prisma.storeFeature.delete({
      where: { id },
    });
    revalidatePath("/");
    revalidatePath("/admin/features");
    return { success: true };
  } catch (error) {
    console.error("Error deleting store feature:", error);
    return { success: false, error: "Failed to delete store feature" };
  }
}

// REORDER: Update sort order of multiple features
export async function reorderStoreFeatures(
  items: { id: string; sortOrder: number }[],
) {
  try {
    const updates = items.map((item) =>
      prisma.storeFeature.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    );
    await prisma.$transaction(updates);
    revalidatePath("/");
    revalidatePath("/admin/features");
    return { success: true };
  } catch (error) {
    console.error("Error reordering store features:", error);
    return { success: false, error: "Failed to reorder store features" };
  }
}
