"use server";

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { put, del } from "@vercel/blob";
import { BLOB_TOKEN } from "@/lib/blob";

export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

// --------------------------------------------------
// Zod Schema for Category Validation
// --------------------------------------------------
const categorySchema = z.object({
  nameAr: z.string().min(2, "Arabic name is required (min 2 chars)"),
  nameEn: z.string().min(2, "English name is required (min 2 chars)"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(
      /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/,
      "Slug must be letters, numbers, and hyphens only",
    ),
  parentId: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// --------------------------------------------------
// GET: Fetch Categories (Storefront - Cached)
// --------------------------------------------------
export async function getCategories(): Promise<
  ActionResponse<CategoryWithCount[]>
> {
  try {
    const categories = await unstable_cache(
      async () => {
        return await prisma.category.findMany({
          where: { isActive: true },
          include: {
            _count: {
              select: {
                products: { where: { isVisible: true, isDeleted: false } },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        });
      },
      ["categories-list"],
      { revalidate: 3600, tags: ["categories"] },
    )();

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error in getCategories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// --------------------------------------------------
// GET: Fetch All Categories for Parent Dropdown
// --------------------------------------------------
export async function getAllCategoriesForSelect() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        parentId: true,
      },
      orderBy: { sortOrder: "asc" },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error in getAllCategoriesForSelect:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// --------------------------------------------------
// GET: Max Sort Order (for smart defaults)
// --------------------------------------------------
export async function getMaxSortOrder() {
  try {
    const result = await prisma.category.aggregate({
      _max: { sortOrder: true },
    });
    return { success: true, data: (result._max.sortOrder ?? 0) + 1 };
  } catch (error) {
    console.error("Error in getMaxSortOrder:", error);
    return { success: true, data: 0 };
  }
}

// --------------------------------------------------
// POST: Create a New Category
// --------------------------------------------------
export async function createCategory(formData: FormData) {
  try {
    // 1. Parse & Validate Fields
    const rawData = {
      nameAr: formData.get("nameAr") as string,
      nameEn: formData.get("nameEn") as string,
      slug: formData.get("slug") as string,
      parentId: (formData.get("parentId") as string) || null,
      sortOrder: Number(formData.get("sortOrder") || 0),
      isActive: formData.get("isActive") === "true",
    };

    const parsed = categorySchema.safeParse(rawData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: `${firstError.path.join(".")}: ${firstError.message}`,
      };
    }

    // 2. Check Slug Uniqueness
    const existingSlug = await prisma.category.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existingSlug) {
      return {
        success: false,
        error: "This slug is already taken. Please use a different one.",
      };
    }

    // 3. Prevent Self-referencing (shouldn't happen on create, but safety check)
    if (parsed.data.parentId) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parsed.data.parentId },
      });
      if (!parentExists) {
        return { success: false, error: "Selected parent category not found." };
      }
    }

    // 4. Handle Image Upload to Vercel Blob
    let imageUrl: string | null = null;
    const file = formData.get("image") as File | null;

    if (file && file.size > 0) {
      const blob = await put(`categories/${parsed.data.slug}/${file.name}`, file, {
        access: "public",
        addRandomSuffix: true,
        token: BLOB_TOKEN,
      });

      imageUrl = blob.url;
    }

    // 5. Create Category in DB
    const category = await prisma.category.create({
      data: {
        nameAr: parsed.data.nameAr,
        nameEn: parsed.data.nameEn,
        slug: parsed.data.slug,
        image: imageUrl,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        parentId: parsed.data.parentId || null,
      },
    });

    // 6. Revalidate
    revalidatePath("/");
    revalidatePath("/admin/categories");

    return { success: true, data: category };
  } catch (error) {
    console.error("Error in createCategory:", error);
    return { success: false, error: "Failed to create category" };
  }
}

// --------------------------------------------------
// GET: Fetch Single Category by ID (for Edit)
// --------------------------------------------------
export async function getCategoryById(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) return { success: false, error: "Category not found" };
    return { success: true, data: category };
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

// --------------------------------------------------
// PUT: Update an Existing Category
// --------------------------------------------------
export async function updateCategory(id: string, formData: FormData) {
  try {
    // 1. Parse & Validate
    const rawData = {
      nameAr: formData.get("nameAr") as string,
      nameEn: formData.get("nameEn") as string,
      slug: formData.get("slug") as string,
      parentId: (formData.get("parentId") as string) || null,
      sortOrder: Number(formData.get("sortOrder") || 0),
      isActive: formData.get("isActive") === "true",
    };

    const parsed = categorySchema.safeParse(rawData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: `${firstError.path.join(".")}: ${firstError.message}`,
      };
    }

    // 2. Check Slug Uniqueness (excluding self)
    const existingSlug = await prisma.category.findFirst({
      where: {
        slug: parsed.data.slug,
        id: { not: id },
      },
    });
    if (existingSlug) {
      return {
        success: false,
        error: "This slug is already taken by another category.",
      };
    }

    // 3. Prevent Circular Dependency
    if (parsed.data.parentId === id) {
      return { success: false, error: "A category cannot be its own parent." };
    }

    // 4. Handle Image Upload to Vercel Blob (only if new file provided)
    let imageUrl: string | undefined = undefined;
    const file = formData.get("image") as File | null;

    if (file && file.size > 0) {
      const blob = await put(`categories/${parsed.data.slug}/${file.name}`, file, {
        access: "public",
        addRandomSuffix: true,
        token: BLOB_TOKEN,
      });

      imageUrl = blob.url;
    }

    // 5. Update DB
    const category = await prisma.category.update({
      where: { id },
      data: {
        nameAr: parsed.data.nameAr,
        nameEn: parsed.data.nameEn,
        slug: parsed.data.slug,
        ...(imageUrl && { image: imageUrl }), // Only update image if new one uploaded
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        parentId: parsed.data.parentId || null,
      },
    });

    // 6. Revalidate
    revalidatePath("/");
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}/edit`);

    return { success: true, data: category };
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return { success: false, error: "Failed to update category" };
  }
}

// --------------------------------------------------
// DELETE: Remove a Category
// --------------------------------------------------
export async function deleteCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (category?.image?.includes("blob.vercel-storage.com")) {
      try {
        await del(category.image, { token: BLOB_TOKEN });
      } catch (e) {
        console.error("Failed to delete category image from Vercel Blob:", e);
      }
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/categories");

    return { success: true };
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
