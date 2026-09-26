"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { transformProduct } from "@/lib/transformers";

export async function getCollections() {
  try {
    const collections = await prisma.productCollection.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
    return { success: true, data: collections };
  } catch (error) {
    console.error("Error fetching collections:", error);
    return { success: false, error: "Failed to fetch collections" };
  }
}

export async function getActiveCollections() {
  try {
    const collections = await prisma.productCollection.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            product: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                slug: true,
                categoryId: true,
                isFeatured: true,
                isVisible: true,
                createdAt: true,
                updatedAt: true,
                images: {
                  take: 2,
                  orderBy: { isMain: "desc" },
                  select: { url: true, altText: true },
                },
                variants: {
                  where: { isDefault: true },
                  take: 1,
                  select: {
                    id: true,
                    price: true,
                    discountPrice: true,
                    colorAr: true,
                    colorEn: true,
                    sizeNameAr: true,
                    sizeNameEn: true,
                    showPrice: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const serializedCollections = collections.map((collection) => ({
      ...collection,
      items: collection.items.map((item) => ({
        ...item,
        product: transformProduct(item.product as any),
      })),
    }));

    return { success: true, data: serializedCollections };
  } catch (error) {
    console.error("Error fetching active collections:", error);
    return { success: false, error: "Failed to fetch active collections" };
  }
}

export async function getCollection(id: string) {
  try {
    const collection = await prisma.productCollection.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            product: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                slug: true,
                categoryId: true,
                isFeatured: true,
                isVisible: true,
                createdAt: true,
                updatedAt: true,
                images: {
                  take: 2,
                  orderBy: { isMain: "desc" },
                  select: { url: true, altText: true },
                },
                variants: {
                  where: { isDefault: true },
                  take: 1,
                  select: {
                    id: true,
                    price: true,
                    discountPrice: true,
                    colorAr: true,
                    colorEn: true,
                    sizeNameAr: true,
                    sizeNameEn: true,
                    showPrice: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!collection) {
      return { success: false, error: "Collection not found" };
    }

    const serializedCollection = {
      ...collection,
      items: collection.items.map((item) => ({
        ...item,
        product: transformProduct(item.product as any),
      })),
    };

    return { success: true, data: serializedCollection };
  } catch (error) {
    console.error("Error fetching collection:", error);
    return { success: false, error: "Failed to fetch collection" };
  }
}

export async function createCollection(data: {
  titleAr: string;
  titleEn: string;
  productIds: string[];
}) {
  try {
    const collection = await prisma.productCollection.create({
      data: {
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        items: {
          create: data.productIds.map((productId, index) => ({
            productId,
            sortOrder: index,
          })),
        },
      },
    });
    revalidatePath("/admin/landing");
    revalidatePath("/");
    return { success: true, data: collection };
  } catch (error) {
    console.error("Error creating collection:", error);
    return { success: false, error: "Failed to create collection" };
  }
}

export async function updateCollection(
  id: string,
  data: { titleAr: string; titleEn: string; productIds: string[] },
) {
  try {
    // Transaction to update details and replace items
    await prisma.$transaction(async (tx) => {
      // 1. Update collection details
      await tx.productCollection.update({
        where: { id },
        data: {
          titleAr: data.titleAr,
          titleEn: data.titleEn,
        },
      });

      // 2. Delete existing items
      await tx.productCollectionItem.deleteMany({
        where: { collectionId: id },
      });

      // 3. Create new items
      if (data.productIds.length > 0) {
        await tx.productCollectionItem.createMany({
          data: data.productIds.map((productId, index) => ({
            collectionId: id,
            productId,
            sortOrder: index,
          })),
        });
      }
    });

    revalidatePath("/admin/landing");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating collection:", error);
    return { success: false, error: "Failed to update collection" };
  }
}

export async function deleteCollection(id: string) {
  try {
    await prisma.productCollection.delete({
      where: { id },
    });
    revalidatePath("/admin/landing");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting collection:", error);
    return { success: false, error: "Failed to delete collection" };
  }
}

export async function toggleCollectionStatus(id: string, isActive: boolean) {
  try {
    await prisma.productCollection.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/admin/landing");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error toggling collection status:", error);
    return { success: false, error: "Failed to toggle status" };
  }
}
