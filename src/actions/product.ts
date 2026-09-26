"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { transformProduct, type StorefrontProduct } from "@/lib/transformers";
import { put, del } from "@vercel/blob";
import { BLOB_TOKEN } from "@/lib/blob";
import { revalidatePath } from "next/cache";

export type ProductFilter = {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  includeHidden?: boolean;
  excludeId?: string;
  sort?: "newest" | "best-selling" | "featured" | "price-asc" | "price-desc";
  isKeto?: boolean;
  isRaw?: boolean;
  isOrganic?: boolean;
};

export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface ProductVariantInput {
  id?: string;
  weightGram: number | string;
  flavorAr?: string;
  flavorEn?: string;
  packageTypeAr?: string;
  packageTypeEn?: string;
  sku?: string;
  price: number | string;
  discountPrice?: number | string | null;
  stockQuantity?: number | string;
  isDefault?: boolean;
}

// Common Variant Selection
const variantSelect = {
  id: true,
  price: true,
  discountPrice: true,
  weightGram: true,
  flavorAr: true,
  flavorEn: true,
  packageTypeAr: true,
  packageTypeEn: true,
  stockQuantity: true,
  isDefault: true,
  sku: true,
};

// Common Product Select for Storefront
const productStorefrontSelect = {
  id: true,
  nameAr: true,
  nameEn: true,
  slug: true,
  descAr: true,
  descEn: true,
  categoryId: true,
  originCountryAr: true,
  originCountryEn: true,
  roastTypeAr: true,
  roastTypeEn: true,
  caloriesPer100g: true,
  proteinPer100g: true,
  isKeto: true,
  isRaw: true,
  isOrganic: true,
  isFeatured: true,
  isBestSeller: true,
  isNewArrival: true,
  isVisible: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: { id: true, nameAr: true, nameEn: true, slug: true },
  },
  images: {
    orderBy: { isMain: "desc" as const },
    select: { url: true, altText: true },
  },
  variants: {
    orderBy: { sortOrder: "asc" as const },
    select: variantSelect,
  },
  _count: {
    select: { images: true, orderItems: true },
  },
};

/**
 * Get products with pagination, search, category filter, and sorting
 */
export async function getProducts({
  categoryId,
  search,
  page = 1,
  limit = 20,
  includeHidden = false,
  excludeId,
  sort = "newest",
  isKeto,
  isRaw,
  isOrganic,
}: ProductFilter) {
  try {
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    if (!includeHidden) {
      where.isVisible = true;
    }

    if (categoryId) where.categoryId = categoryId;
    if (excludeId) where.id = { not: excludeId };
    if (isKeto) where.isKeto = true;
    if (isRaw) where.isRaw = true;
    if (isOrganic) where.isOrganic = true;

    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
        { descAr: { contains: search, mode: "insensitive" } },
        { descEn: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "best-selling") {
      orderBy = { isBestSeller: "desc" };
    } else if (sort === "featured") {
      orderBy = { isFeatured: "desc" };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: productStorefrontSelect,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const transformed = products.map((p) => transformProduct(p as any));

    return {
      success: true,
      data: {
        products: transformed,
        total,
        totalPages: Math.ceil(total / limit),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error in getProducts:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product || product.isDeleted || !product.isVisible) {
      return { success: false, error: "Product not found" };
    }

    const serializedProduct = {
      ...product,
      proteinPer100g:
        product.proteinPer100g !== null && product.proteinPer100g !== undefined
          ? Number(product.proteinPer100g)
          : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        discountPrice:
          v.discountPrice !== null && v.discountPrice !== undefined
            ? Number(v.discountPrice)
            : null,
      })),
    };

    return { success: true, data: serializedProduct };
  } catch (error) {
    console.error("Error in getProductBySlug:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

/**
 * Get product by ID (Admin or Direct lookup)
 */
export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product || product.isDeleted) {
      return { success: false, error: "Product not found" };
    }

    const serializedProduct = {
      ...product,
      proteinPer100g:
        product.proteinPer100g !== null && product.proteinPer100g !== undefined
          ? Number(product.proteinPer100g)
          : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        discountPrice:
          v.discountPrice !== null && v.discountPrice !== undefined
            ? Number(v.discountPrice)
            : null,
      })),
    };

    return { success: true, data: serializedProduct };
  } catch (error) {
    console.error("Error in getProductById:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

/**
 * Get featured products for homepage / sections
 */
export async function getFeaturedProducts(options?: {
  limit?: number;
  categoryId?: string;
  search?: string;
}) {
  try {
    const { limit = 8, categoryId, search } = options || {};
    const where: Prisma.ProductWhereInput = {
      isVisible: true,
      isDeleted: false,
      isFeatured: true,
    };

    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      select: productStorefrontSelect,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: products.map((p) => transformProduct(p as any)) };
  } catch (error) {
    console.error("Error in getFeaturedProducts:", error);
    return { success: false, error: "Failed to fetch featured products" };
  }
}

/**
 * Get new arrivals
 */
export async function getNewArrivals(options?: {
  limit?: number;
  categoryId?: string;
  search?: string;
}) {
  try {
    const { limit = 8, categoryId, search } = options || {};
    const where: Prisma.ProductWhereInput = {
      isVisible: true,
      isDeleted: false,
    };

    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      select: productStorefrontSelect,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: products.map((p) => transformProduct(p as any)) };
  } catch (error) {
    console.error("Error in getNewArrivals:", error);
    return { success: false, error: "Failed to fetch new arrivals" };
  }
}

/**
 * Get best sellers
 */
export async function getBestSellers(options?: {
  limit?: number;
  categoryId?: string;
  search?: string;
}) {
  try {
    const { limit = 8, categoryId, search } = options || {};
    const where: Prisma.ProductWhereInput = {
      isVisible: true,
      isDeleted: false,
      isBestSeller: true,
    };

    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      select: productStorefrontSelect,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: products.map((p) => transformProduct(p as any)) };
  } catch (error) {
    console.error("Error in getBestSellers:", error);
    return { success: false, error: "Failed to fetch best sellers" };
  }
}

/**
 * Get products by IDs
 */
export async function getProductsByIds(ids: string[]) {
  try {
    if (!ids || ids.length === 0) return { success: true, data: [] };

    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
        isDeleted: false,
        isVisible: true,
      },
      select: productStorefrontSelect,
    });

    return { success: true, data: products.map((p) => transformProduct(p as any)) };
  } catch (error) {
    console.error("Error in getProductsByIds:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

/**
 * Get special offers / discounted products
 */
export async function getSpecialOffers(params?: number | { categoryId?: string; search?: string; limit?: number }) {
  try {
    const limit = typeof params === "number" ? params : (params?.limit || 8);
    const categoryId = typeof params === "object" ? params.categoryId : undefined;
    const search = typeof params === "object" ? params.search : undefined;

    const where: Prisma.ProductWhereInput = {
      isVisible: true,
      isDeleted: false,
      variants: {
        some: {
          discountPrice: { not: null, gt: 0 },
        },
      },
    };

    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      select: productStorefrontSelect,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: products.map((p) => transformProduct(p as any)) };
  } catch (error) {
    console.error("Error in getSpecialOffers:", error);
    return { success: false, error: "Failed to fetch special offers" };
  }
}

/**
 * Create a new Product
 */
export async function createProduct(formData: FormData) {
  try {
    const nameAr = formData.get("nameAr") as string;
    const nameEn = formData.get("nameEn") as string;
    let slug = formData.get("slug") as string;
    const categoryId = formData.get("categoryId") as string;

    if (!nameAr || !nameEn || !categoryId) {
      return { success: false, error: "الاسم والتصنيف مطلوبان" };
    }

    if (!slug) {
      const baseSlug = nameEn
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      slug = `${baseSlug}-${randomSuffix}`;
    }

    const data = {
      nameAr,
      nameEn,
      slug,
      categoryId,
      descAr: (formData.get("descAr") as string) || null,
      descEn: (formData.get("descEn") as string) || null,
      originCountryAr: (formData.get("originCountryAr") as string) || null,
      originCountryEn: (formData.get("originCountryEn") as string) || null,
      roastTypeAr: (formData.get("roastTypeAr") as string) || null,
      roastTypeEn: (formData.get("roastTypeEn") as string) || null,
      caloriesPer100g: formData.get("caloriesPer100g")
        ? Number(formData.get("caloriesPer100g"))
        : null,
      proteinPer100g: formData.get("proteinPer100g")
        ? Number(formData.get("proteinPer100g"))
        : null,
      isKeto: formData.get("isKeto") === "true",
      isRaw: formData.get("isRaw") === "true",
      isOrganic: formData.get("isOrganic") === "true",
      isFeatured: formData.get("isFeatured") === "true",
      isBestSeller: formData.get("isBestSeller") === "true",
      isNewArrival: formData.get("isNewArrival") === "true",
      isVisible: formData.get("isVisible") !== "false",
    };

    // Variants
    const variantsJson = formData.get("variants") as string;
    const variantsData: ProductVariantInput[] = JSON.parse(variantsJson || "[]");

    // Images
    const files = formData.getAll("images") as File[];
    const imagesMetaJson = formData.get("newImagesMeta") as string;
    const imagesMeta = JSON.parse(imagesMetaJson || "[]");

    const uploadedImages: { url: string; altText: string; isMain: boolean }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || file.size === 0) continue;

      if (BLOB_TOKEN) {
        const blob = await put(`nuts/${slug}/${file.name}`, file, {
          access: "public",
          addRandomSuffix: true,
          token: BLOB_TOKEN,
        });
        const meta = imagesMeta[i] || {};
        uploadedImages.push({
          url: blob.url,
          altText: meta.altText || nameAr,
          isMain: meta.isMain || i === 0,
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        variants: {
          create: variantsData.map((v, index) => ({
            weightGram: Number(v.weightGram) || 250,
            flavorAr: v.flavorAr || null,
            flavorEn: v.flavorEn || null,
            packageTypeAr: v.packageTypeAr || "كيس محكم الغلق",
            packageTypeEn: v.packageTypeEn || "Sealed Pouch",
            sku: v.sku || `NUT-${Date.now()}-${index}`,
            price: Number(v.price) || 0,
            discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
            stockQuantity: Number(v.stockQuantity) || 10,
            isDefault: v.isDefault ?? index === 0,
            sortOrder: index,
          })),
        },
        images: {
          create: uploadedImages.map((img, index) => ({
            url: img.url,
            altText: img.altText,
            isMain: img.isMain,
            sortOrder: index,
          })),
        },
      },
      include: { images: true, variants: true },
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true, data: product };
  } catch (error) {
    console.error("Error in createProduct:", error);
    return { success: false, error: "Failed to create product" };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, formData: FormData) {
  try {
    const nameAr = formData.get("nameAr") as string;
    const nameEn = formData.get("nameEn") as string;
    const categoryId = formData.get("categoryId") as string;

    const data = {
      nameAr,
      nameEn,
      categoryId,
      descAr: (formData.get("descAr") as string) || null,
      descEn: (formData.get("descEn") as string) || null,
      originCountryAr: (formData.get("originCountryAr") as string) || null,
      originCountryEn: (formData.get("originCountryEn") as string) || null,
      roastTypeAr: (formData.get("roastTypeAr") as string) || null,
      roastTypeEn: (formData.get("roastTypeEn") as string) || null,
      caloriesPer100g: formData.get("caloriesPer100g")
        ? Number(formData.get("caloriesPer100g"))
        : null,
      proteinPer100g: formData.get("proteinPer100g")
        ? Number(formData.get("proteinPer100g"))
        : null,
      isKeto: formData.get("isKeto") === "true",
      isRaw: formData.get("isRaw") === "true",
      isOrganic: formData.get("isOrganic") === "true",
      isFeatured: formData.get("isFeatured") === "true",
      isBestSeller: formData.get("isBestSeller") === "true",
      isNewArrival: formData.get("isNewArrival") === "true",
      isVisible: formData.get("isVisible") !== "false",
    };

    const variantsJson = formData.get("variants") as string;
    const variantsData: ProductVariantInput[] = JSON.parse(variantsJson || "[]");

    await prisma.$transaction(async (tx) => {
      // 1. Update basic info
      await tx.product.update({
        where: { id: productId },
        data,
      });

      // 2. Sync variants
      const existingVariantIds = variantsData
        .filter((v) => v.id)
        .map((v) => v.id as string);

      await tx.productVariant.deleteMany({
        where: {
          productId,
          id: { notIn: existingVariantIds },
        },
      });

      for (let i = 0; i < variantsData.length; i++) {
        const v = variantsData[i];
        const payload = {
          weightGram: Number(v.weightGram) || 250,
          flavorAr: v.flavorAr || null,
          flavorEn: v.flavorEn || null,
          packageTypeAr: v.packageTypeAr || "كيس محكم الغلق",
          packageTypeEn: v.packageTypeEn || "Sealed Pouch",
          sku: v.sku || `NUT-${Date.now()}-${i}`,
          price: Number(v.price) || 0,
          discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
          stockQuantity: Number(v.stockQuantity) || 10,
          isDefault: v.isDefault ?? i === 0,
          sortOrder: i,
        };

        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: payload,
          });
        } else {
          await tx.productVariant.create({
            data: {
              ...payload,
              productId,
            },
          });
        }
      }
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath(`/product`);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return { success: false, error: "Failed to update product" };
  }
}

/**
 * Delete product (Soft delete)
 */
export async function deleteProduct(id: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true, isVisible: false },
    });

    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

/**
 * Duplicate a product
 */
export async function duplicateProduct(id: string) {
  try {
    const original = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true },
    });

    if (!original) return { success: false, error: "Product not found" };

    const newSlug = `${original.slug}-copy-${Date.now()}`;

    const duplicated = await prisma.product.create({
      data: {
        nameAr: `${original.nameAr} (نسخة)`,
        nameEn: `${original.nameEn} (Copy)`,
        slug: newSlug,
        descAr: original.descAr,
        descEn: original.descEn,
        categoryId: original.categoryId,
        originCountryAr: original.originCountryAr,
        originCountryEn: original.originCountryEn,
        roastTypeAr: original.roastTypeAr,
        roastTypeEn: original.roastTypeEn,
        caloriesPer100g: original.caloriesPer100g,
        proteinPer100g: original.proteinPer100g,
        isKeto: original.isKeto,
        isRaw: original.isRaw,
        isOrganic: original.isOrganic,
        isFeatured: false,
        isVisible: false,
        variants: {
          create: original.variants.map((v) => ({
            weightGram: v.weightGram,
            flavorAr: v.flavorAr,
            flavorEn: v.flavorEn,
            packageTypeAr: v.packageTypeAr,
            packageTypeEn: v.packageTypeEn,
            price: v.price,
            discountPrice: v.discountPrice,
            stockQuantity: v.stockQuantity,
            isDefault: v.isDefault,
            sku: `NUT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          })),
        },
        images: {
          create: original.images.map((img) => ({
            url: img.url,
            altText: img.altText,
            isMain: img.isMain,
            sortOrder: img.sortOrder,
          })),
        },
      },
    });

    revalidatePath("/admin/products");
    return { success: true, data: duplicated };
  } catch (error) {
    console.error("Error in duplicateProduct:", error);
    return { success: false, error: "Failed to duplicate product" };
  }
}

/**
 * Toggle visibility of a product
 */
export async function toggleProductStatus(id: string, forceVisible?: boolean) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { isVisible: true },
    });
    if (!product) return { success: false, error: "Product not found" };

    const newStatus = typeof forceVisible === "boolean" ? forceVisible : !product.isVisible;
    const updated = await prisma.product.update({
      where: { id },
      data: { isVisible: newStatus },
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling product status:", error);
    return { success: false, error: "Failed to toggle status" };
  }
}

/**
 * Toggle featured flag of a product
 */
export async function toggleProductFeatured(id: string, forceFeatured?: boolean) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { isFeatured: true },
    });
    if (!product) return { success: false, error: "Product not found" };

    const newFeatured = typeof forceFeatured === "boolean" ? forceFeatured : !product.isFeatured;
    const updated = await prisma.product.update({
      where: { id },
      data: { isFeatured: newFeatured },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling product featured:", error);
    return { success: false, error: "Failed to toggle featured" };
  }
}

/**
 * Delete a product image
 */
export async function deleteProductImage(imageId: string) {
  try {
    const image = await prisma.productImage.delete({
      where: { id: imageId },
    });
    return { success: true, data: image };
  } catch (error) {
    console.error("Error deleting product image:", error);
    return { success: false, error: "Failed to delete image" };
  }
}

/**
 * Set main product image
 */
export async function setProductMainImage(productId: string, imageId: string) {
  try {
    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { productId },
        data: { isMain: false },
      }),
      prisma.productImage.update({
        where: { id: imageId },
        data: { isMain: true },
      }),
    ]);
    return { success: true };
  } catch (error) {
    console.error("Error setting main image:", error);
    return { success: false, error: "Failed to set main image" };
  }
}

/**
 * Upload multiple images for a product
 */
export async function uploadProductImages(productId: string, formData: FormData) {
  try {
    const files = formData.getAll("files") as File[];
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !(file instanceof File) || file.size === 0) continue;

      const blob = await put(`products/${Date.now()}-${file.name}`, file, {
        access: "public",
        token: BLOB_TOKEN,
      });

      const img = await prisma.productImage.create({
        data: {
          productId,
          url: blob.url,
          isMain: i === 0,
          sortOrder: i,
        },
      });
      uploadedImages.push(img);
    }

    revalidatePath(`/admin/products/${productId}/images`);
    return { success: true, data: uploadedImages };
  } catch (error) {
    console.error("Error uploading product images:", error);
    return { success: false, error: "Failed to upload images" };
  }
}

