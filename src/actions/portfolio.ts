"use server";

import { prisma } from "@/lib/db";
import { PortfolioCategory, PortfolioItem, MediaType } from "@prisma/client";
import { put, del } from "@vercel/blob";
import { BLOB_TOKEN } from "@/lib/blob";

export type PortfolioCategoryWithItems = PortfolioCategory & {
  items: PortfolioItem[];
};

export async function getPortfolioCategories() {
  try {
    const categories = await prisma.portfolioCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return { success: true, data: categories };
  } catch {
    return { success: false, error: "Failed to load portfolio" };
  }
}

// --- Mutations ---

import { revalidatePath } from "next/cache";

export async function createPortfolioCategory(data: {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  logo?: string;
  coverImage?: string;
  accentColor?: string;
  fontFamily?: string;
}) {
  try {
    const category = await prisma.portfolioCategory.create({
      data: {
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        logo: data.logo,
        coverImage: data.coverImage,
        accentColor: data.accentColor,
        fontFamily: data.fontFamily,
        // Auto-increment sortOrder
        sortOrder: await (async () => {
          const last = await prisma.portfolioCategory.findFirst({
            orderBy: { sortOrder: "desc" },
          });
          return (last?.sortOrder ?? -1) + 1;
        })(),
      },
    });
    revalidatePath("/works");
    revalidatePath("/admin/portfolio");
    return { success: true, data: category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function reorderPortfolioCategories(
  items: { id: string; sortOrder: number }[],
) {
  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.portfolioCategory.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    revalidatePath("/works");
    revalidatePath("/admin/portfolio");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder categories:", error);
    return { success: false, error: "Failed to reorder categories" };
  }
}

export async function updatePortfolioCategory(
  id: string,
  data: {
    titleAr?: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    logo?: string;
    coverImage?: string;
    accentColor?: string;
    fontFamily?: string;
    isActive?: boolean;
    sortOrder?: number;
  },
) {
  try {
    const category = await prisma.portfolioCategory.update({
      where: { id },
      data,
    });
    revalidatePath("/works");
    revalidatePath("/admin/portfolio");
    return { success: true, data: category };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deletePortfolioCategory(id: string) {
  try {
    await prisma.portfolioCategory.delete({ where: { id } });
    revalidatePath("/works");
    revalidatePath("/admin/portfolio");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

export async function createPortfolioItem(data: {
  categoryId: string;
  mediaUrl: string;
  mediaType: MediaType;
  thumbnailUrl?: string; // Optional, mainly for video
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  whatsappMessage?: string;
}) {
  try {
    const item = await prisma.portfolioItem.create({
      data: {
        categoryId: data.categoryId,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        thumbnailUrl: data.thumbnailUrl,
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        descriptionAr: data.descriptionAr,
        descriptionEn: data.descriptionEn,
        whatsappMessage: data.whatsappMessage,
        sortOrder: await (async () => {
          const lastItem = await prisma.portfolioItem.findFirst({
            where: { categoryId: data.categoryId },
            orderBy: { sortOrder: "desc" },
          });
          return (lastItem?.sortOrder ?? -1) + 1;
        })(),
      },
    });
    revalidatePath("/works");
    revalidatePath("/admin/portfolio"); // And sub-paths if needed
    return { success: true, data: item };
  } catch (error) {
    console.error("Failed to create content:", error);
    return { success: false, error: "Failed to create content" };
  }
}

export async function updatePortfolioItem(
  id: string,
  data: {
    mediaUrl?: string;
    mediaType?: MediaType;
    thumbnailUrl?: string;
    titleAr?: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    whatsappMessage?: string;
    isActive?: boolean;
    sortOrder?: number;
  },
) {
  try {
    const item = await prisma.portfolioItem.update({
      where: { id },
      data,
    });
    revalidatePath("/works");
    revalidatePath("/admin/portfolio");
    return { success: true, data: item };
  } catch (error) {
    console.error("Failed to update content:", error);
    return { success: false, error: "Failed to update content" };
  }
}

export async function deletePortfolioItem(id: string) {
  try {
    const item = await prisma.portfolioItem.findUnique({
      where: { id },
    });
    if (item?.mediaUrl.includes("blob.vercel-storage.com")) {
      await del(item.mediaUrl, { token: BLOB_TOKEN });
    }
    await prisma.portfolioItem.delete({ where: { id } });
    revalidatePath("/works");
    revalidatePath("/admin/portfolio");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete content:", error);
    return { success: false, error: "Failed to delete content" };
  }
}

export async function getPortfolioItems(categoryId?: string) {
  try {
    const whereClause = {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
    };

    const items = await prisma.portfolioItem.findMany({
      where: whereClause,
      orderBy: { sortOrder: "asc" },
      include: {
        category: true,
      },
    });
    return { success: true, data: items };
  } catch (error) {
    console.error("Failed to fetch portfolio items:", error);
    return { success: false, error: "Failed to load items" };
  }
}

export async function reorderPortfolioItems(
  items: { id: string; sortOrder: number }[],
) {
  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.portfolioItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    revalidatePath("/works");
    revalidatePath("/admin/portfolio");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder items:", error);
    return { success: false, error: "Failed to reorder items" };
  }
}

export async function uploadPortfolioMedia(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "No file provided" };

    const isVideo = file.type.startsWith("video/");
    const folder = (formData.get("folder") as string) || "portfolio";

    const blob = await put(`${folder}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      token: BLOB_TOKEN,
    });

    return {
      success: true,
      data: {
        url: blob.url,
        publicId: blob.pathname,
        resourceType: isVideo ? "video" : "image",
        thumbnailUrl: isVideo
          ? blob.url.replace(/\.[^/.]+$/, ".jpg")
          : undefined, 
      },
    };
  } catch (error) {
    console.error("Failed to upload media:", error);
    return { success: false, error: "Failed to upload media" };
  }
}
