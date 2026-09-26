"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { transformProduct } from "@/lib/transformers";
import { put, del } from "@vercel/blob";
import { BLOB_TOKEN } from "@/lib/blob";

export type ProductFilter = {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  includeHidden?: boolean;
  excludeId?: string;
  sort?: "newest" | "best-selling" | "featured";
};

export type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface ProductVariantInput {
  id?: string;
  detailedSizeAr?: string;
  detailedSizeEn?: string;
  colorAr?: string;
  colorEn?: string;
  sku?: string;
  price: number | string;
  discountPrice?: number | string | null;
  stock?: number | string;
  isDefault?: boolean;
  showPrice?: boolean;
}


export async function getProducts({
  categoryId,
  search,
  page = 1,
  limit = 20,
  includeHidden = false,
  excludeId,
  sort,
}: ProductFilter) {
  try {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {
      isDeleted: false,
    };

    if (!includeHidden) {
      where.isVisible = true;
    }

    if (categoryId) where.categoryId = categoryId;
    if (excludeId) where.id = { not: excludeId };
    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
        { descAr: { contains: search, mode: "insensitive" } },
        { descEn: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = {
      isFeatured: "desc",
    };
    if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "best-selling") {
      orderBy = { whatsAppOrders: { _count: "desc" } };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
          categoryId: true,
          images: {
            take: 1,
            orderBy: { isMain: "desc" },
            select: { url: true, altText: true },
          },
          variants: {
            where: { isDefault: true },
            select: {
              id: true,
              price: true,
              discountPrice: true,
              colorAr: true,
              colorEn: true,
              sizeNameAr: true,
              sizeNameEn: true,
              showPrice: true,
             stock: true,
             },
            take: 1,
          },
          category: {
            select: { id: true, nameAr: true, nameEn: true, slug: true },
          },
          isFeatured: true,
          isVisible: true,
          _count: { select: { images: true, whatsAppOrders: true } },
          recommendedSize: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    const transformedProducts = products.map(transformProduct);

    return {
      success: true,
      data: {
        products: transformedProducts,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error in getProducts:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug, isDeleted: false },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        category: true,
      },
    });

    if (!product) return { success: false, error: "Product not found" };

    // Convert Decimals to numbers for client components
    const transformedProduct = {
      ...product,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
        showPrice: v.showPrice,
      })),
    };

    return { success: true, data: transformedProduct };
  } catch (error) {
    console.error(`Error in getProductBySlug (${slug}):`, error);
    return { success: false, error: "Failed to fetch product details" };
  }
}

// Fetch featured/on-sale products for homepage
export async function getProductsByIds(ids: string[]) {
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isDeleted: false },
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        slug: true,
        categoryId: true,
        images: {
          take: 1,
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
           stock: true,
             },
        },
        category: {
          select: { id: true, nameAr: true, nameEn: true, slug: true },
        },
        isFeatured: true,
        isVisible: true,
        _count: { select: { images: true, whatsAppOrders: true } },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const transformed = products.map(transformProduct);

    return { success: true, data: transformed };
  } catch (error) {
    console.error("Error in getProductsByIds:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function getFeaturedProducts(options?: {
  limit?: number;
  categoryId?: string;
  search?: string;
}) {
  try {
    const { limit = 20, categoryId, search } = options || {};
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
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        slug: true,
        categoryId: true,
        images: {
          take: 1,
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
           stock: true,
             },
        },
        category: {
          select: { id: true, nameAr: true, nameEn: true, slug: true },
        },
        isFeatured: true,
        isVisible: true,
        _count: { select: { images: true, whatsAppOrders: true } },
        createdAt: true,
        updatedAt: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const transformed = products.map(transformProduct);

    return { success: true, data: transformed };
  } catch (error) {
    console.error("Error in getFeaturedProducts:", error);
    return { success: false, error: "Failed to fetch featured products" };
  }
}

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
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        slug: true,
        categoryId: true,
        images: {
          take: 1,
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
           stock: true,
             },
        },
        category: {
          select: { id: true, nameAr: true, nameEn: true, slug: true },
        },
        isFeatured: true,
        isVisible: true,
        _count: { select: { images: true, whatsAppOrders: true } },
        createdAt: true,
        updatedAt: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const transformed = products.map(transformProduct);

    return { success: true, data: transformed };
  } catch (error) {
    console.error("Error in getNewArrivals:", error);
    return { success: false, error: "Failed to fetch new arrivals" };
  }
}

export async function getBestSellers(options?: {
  limit?: number;
  categoryId?: string;
  search?: string;
}) {
  try {
    const { limit = 8, categoryId, search } = options || {};

    // 1. Get IDs of New Arrivals (latest 8) to exclude them
    // Note: If we are filtering, we might technically be excluding "New Arrivals" that MATCH the filter.
    // Ideally we strictly exclude the GLOBAL new arrivals to maintain the definition of "Best Sellers" vs "New Arrivals".
    // Or we exclude "New Arrivals" within this category.
    // Let's stick to global exclusion for consistency with the homepage logic.
    const newArrivals = await prisma.product.findMany({
      where: { isVisible: true, isDeleted: false },
      select: { id: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    const excludedIds = newArrivals.map((p) => p.id);

    const where: Prisma.ProductWhereInput = {
      isVisible: true,
      isDeleted: false,
      id: { notIn: excludedIds },
    };

    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
      ];
    }

    // 2. Fetch Best Sellers (excluding new arrivals)
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        slug: true,
        categoryId: true,
        images: {
          take: 1,
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
           stock: true,
             },
        },
        category: {
          select: { id: true, nameAr: true, nameEn: true, slug: true },
        },
        isFeatured: true,
        isVisible: true,
        _count: { select: { images: true, whatsAppOrders: true } },
        createdAt: true,
        updatedAt: true,
      },
      take: limit,
      orderBy: { nameEn: "asc" }, // Should ideally be by sales count if we had it, but sorting by nameEn is legacy behavior here.
      // Actually, line 376 in original was orderBy nameEn. In getProducts count was whatsAppOrders.
      // I will keep nameEn to avoid changing behavior, but worth noting.
    });

    const transformed = products.map(transformProduct);

    return { success: true, data: transformed };
  } catch (error) {
    console.error("Error in getBestSellers:", error);
    return { success: false, error: "Failed to fetch best sellers" };
  }
}

export async function getSpecialOffers(options?: {
  limit?: number;
  categoryId?: string;
  search?: string;
}) {
  try {
    const { limit = 20, categoryId, search } = options || {};
    const where: Prisma.ProductWhereInput = {
      isVisible: true,
      isDeleted: false,
      variants: {
        some: {
          discountPrice: { not: null },
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
      select: {
        id: true,
        nameAr: true,
        nameEn: true,
        slug: true,
        categoryId: true,
        images: {
          take: 1,
          orderBy: { isMain: "desc" },
          select: { url: true, altText: true },
        },
        variants: {
          where: { discountPrice: { not: null } },
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
        category: {
          select: { id: true, nameAr: true, nameEn: true, slug: true },
        },
        isFeatured: true,
        isVisible: true,
        _count: { select: { images: true, whatsAppOrders: true } },
        createdAt: true,
        updatedAt: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const transformed = products.map(transformProduct);

    return { success: true, data: transformed };
  } catch (error) {
    console.error("Error in getSpecialOffers:", error);
    return { success: false, error: "Failed to fetch special offers" };
  }
}

// ---------------------------------------------------------
// NEW: Create Product with Vercel Blob Image Upload
// ---------------------------------------------------------
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  try {
    // 1. Basic & Technical Fields
    const data = {
      nameAr: formData.get("nameAr") as string,
      nameEn: formData.get("nameEn") as string,
      slug: formData.get("slug") as string,
      categoryId: formData.get("categoryId") as string,
      descAr: formData.get("descAr") as string,
      descEn: formData.get("descEn") as string,
      materialAr: formData.get("materialAr") as string,
      materialEn: formData.get("materialEn") as string,
      madeInAr: formData.get("madeInAr") as string,
      madeInEn: formData.get("madeInEn") as string,
      warrantyAr: formData.get("warrantyAr") as string,
      warrantyEn: formData.get("warrantyEn") as string,
      installmentInfoAr: formData.get("installmentInfoAr") as string,
      installmentInfoEn: formData.get("installmentInfoEn") as string,
      deliveryInstallationAr: formData.get("deliveryInstallationAr") as string,
      deliveryInstallationEn: formData.get("deliveryInstallationEn") as string,
      recommendedSize: formData.get("recommendedSize") as string,
      isVisible: formData.get("isVisible") === "true",
      isFeatured: formData.get("isFeatured") === "true",
    };

    // Auto-generate slug if missing
    if (!data.slug) {
      const baseSlug = (data.nameEn || "product")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.slug = `${baseSlug}-${randomSuffix}`;
    }

    // 2. Parse Variants (JSON string from client)
    const variantsJson = formData.get("variants") as string;
    const variantsData = JSON.parse(variantsJson || "[]");

    // 3. Handle Images (Multiple files)
    const files = formData.getAll("images") as File[];
    const imagesMetaJson = formData.get("newImagesMeta") as string;
    const imagesMeta = JSON.parse(imagesMetaJson || "[]");

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || file.size === 0) continue;

      const blob = await put(`products/${data.slug}/${file.name}`, file, {
        access: "public",
        addRandomSuffix: true,
        token: BLOB_TOKEN,
      });

      const meta = imagesMeta[i] || {};
      uploadedImages.push({
        url: blob.url,
        publicId: blob.pathname,
        altText: meta.altText || data.nameEn,
        isMain: meta.isMain || false,
      });
    }

    // 4. Save to DB
    const product = await prisma.product.create({
      data: {
        ...data,
        variants: {
          create: variantsData.map((v: ProductVariantInput) => ({
            detailedSizeAr: v.detailedSizeAr,
            detailedSizeEn: v.detailedSizeEn,
            colorAr: v.colorAr,
            colorEn: v.colorEn,
            sku:
              v.sku ||
              `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            price: Number(v.price),
            discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
            stock: Number(v.stock || 0),
            isDefault: v.isDefault || false,
            showPrice: v.showPrice ?? true,
          })),
        },
        images: {
          create: uploadedImages.map((img, index) => ({
            url: img.url,
            publicId: img.publicId,
            altText: img.altText,
            isMain: img.isMain,
            sortOrder: index,
          })),
        },
      },
      include: { images: true },
    });

    revalidatePath("/");
    revalidatePath("/product");
    revalidatePath("/admin/products");
    return { success: true, data: product };
  } catch (error) {
    console.error("Error in createProduct:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = (error.meta?.target as string[]) || [];
      if (target.includes("slug")) {
        return { 
          success: false, 
          error: "A product with this URL (slug) already exists. Please use a different one or leave it empty to auto-generate." 
        };
      }
    }
    const message = error instanceof Error ? error.message : "An unknown error occurred while creating the product.";
    return { success: false, error: `Failed to create product: ${message}` };
  }
}

/**
 * Upload images for an existing product
 */
export async function uploadProductImages(
  productId: string,
  formData: FormData,
) {
  try {
    const files = formData.getAll("images") as File[];

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      console.error(`[Upload] Product ${productId} not found`);
      return { success: false, error: "Product not found" };
    }

    let currentSortOrder = product.images.length;
    const uploadedImages = [];

    for (const file of files) {
      if (!file || file.size === 0) continue;

      const blob = await put(`products/${product.slug}/${file.name}`, file, {
        access: "public",
        addRandomSuffix: true,
        token: BLOB_TOKEN,
      });

      uploadedImages.push({
        url: blob.url,
        publicId: blob.pathname,
        productId: productId,
        altText: product.nameEn,
        isMain: product.images.length === 0 && uploadedImages.length === 0,
        sortOrder: currentSortOrder++,
      });
    }

    if (uploadedImages.length > 0) {
      await prisma.productImage.createMany({
        data: uploadedImages,
      });
    }

    revalidatePath(`/product/${product.slug}`);
    revalidatePath(`/admin/products/${productId}/images`);

    return { success: true, data: uploadedImages };
  } catch (error) {
    console.error("Error in uploadProductImages:", error);
    const message = error instanceof Error ? error.message : "Failed to upload images";
    return { success: false, error: `Upload error: ${message}` };
  }
}

/**
 * Fetch a single product by its ID with all relations
 */
export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          orderBy: { createdAt: "asc" },
        },
        category: true,
      },
    });

    if (!product) return { success: false, error: "Product not found" };

    // Convert Decimals to numbers for client components
    const transformedProduct = {
      ...product,
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
        showPrice: v.showPrice,
      })),
    };

    return { success: true, data: transformedProduct };
  } catch (error) {
    console.error("Error in getProductById:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, formData: FormData) {
  try {
    // 1. Basic & Technical Fields
    const data = {
      nameAr: formData.get("nameAr") as string,
      nameEn: formData.get("nameEn") as string,
      slug: formData.get("slug") as string,
      categoryId: formData.get("categoryId") as string,
      descAr: formData.get("descAr") as string,
      descEn: formData.get("descEn") as string,
      materialAr: formData.get("materialAr") as string,
      materialEn: formData.get("materialEn") as string,
      madeInAr: formData.get("madeInAr") as string,
      madeInEn: formData.get("madeInEn") as string,
      warrantyAr: formData.get("warrantyAr") as string,
      warrantyEn: formData.get("warrantyEn") as string,
      installmentInfoAr: formData.get("installmentInfoAr") as string,
      installmentInfoEn: formData.get("installmentInfoEn") as string,
      deliveryInstallationAr: formData.get("deliveryInstallationAr") as string,
      deliveryInstallationEn: formData.get("deliveryInstallationEn") as string,
      recommendedSize: formData.get("recommendedSize") as string,
      isVisible: formData.get("isVisible") === "true",
      isFeatured: formData.get("isFeatured") === "true",
    };

    // Auto-generate slug if missing
    if (!data.slug) {
      const baseSlug = (data.nameEn || "product")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      data.slug = `${baseSlug}-${randomSuffix}`;
    }

    // 2. Parse Variants & Images Meta
    const variantsJson = formData.get("variants") as string;
    const variantsData = JSON.parse(variantsJson || "[]");

    const existingImagesMetaJson = formData.get("existingImagesMeta") as string;
    const existingImagesMeta = JSON.parse(existingImagesMetaJson || "[]");

    const newImagesMetaJson = formData.get("newImagesMeta") as string;
    const newImagesMeta = JSON.parse(newImagesMetaJson || "[]");

    // 3. Handle New Images if any
    const files = formData.getAll("images") as File[];
    const uploadedImages: {
      url: string;
      publicId: string;
      altTextEn: string;
      altTextAr: string;
      isMain: boolean;
      sortOrder: number;
    }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || file.size === 0) continue;

      const blob = await put(`products/${data.slug}/${file.name}`, file, {
        access: "public",
        addRandomSuffix: true,
        token: BLOB_TOKEN,
      });

      const meta = newImagesMeta[i] || {};
      uploadedImages.push({
        url: blob.url,
        publicId: blob.pathname,
        altTextEn: meta.altTextEn || meta.altText || data.nameEn,
        altTextAr: meta.altTextAr || meta.altText || data.nameAr,
        isMain: meta.isMain || false,
        sortOrder: meta.sortOrder || 0,
      });
    }

    // 4. Perform Transaction for Data Consistency
    const result = await prisma.$transaction(
      async (tx) => {
        // A. Update Basic Info
        const product = await tx.product.update({
          where: { id: productId },
          data: {
            ...data,
            // B. Update Existing Images Meta
            images: {
              update: existingImagesMeta.map(
                (img: {
                  id: string;
                  altText?: string;
                  isMain?: boolean;
                  sortOrder?: number;
                }) => ({
                  where: { id: img.id },
                  data: {
                    altText: img.altText,
                    isMain: img.isMain,
                    sortOrder: img.sortOrder,
                  },
                }),
              ),
              // C. Add New Images
              create: uploadedImages.map((img, index) => ({
                url: img.url,
                publicId: img.publicId,
                altText: img.altTextEn,
                isMain: img.isMain,
                sortOrder: existingImagesMeta.length + index,
              })),
            },
          },
        });

        // D. Sync Variants
        const variantIds = variantsData
          .filter((v: ProductVariantInput) => v.id)
          .map((v: ProductVariantInput) => v.id);

        // Delete removed variants
        await tx.productVariant.deleteMany({
          where: {
            productId,
            id: { notIn: variantIds },
          },
        });

        // Upsert current variants
        const variantPromises = (variantsData as ProductVariantInput[]).map(
          (v) => {
            const variantPayload = {
              detailedSizeAr: v.detailedSizeAr,
              detailedSizeEn: v.detailedSizeEn,
              colorAr: v.colorAr,
              colorEn: v.colorEn,
              sku:
                v.sku ||
                `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              price: Number(v.price),
              discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
              stock: Number(v.stock || 0),
              isDefault: v.isDefault || false,
              showPrice: v.showPrice ?? true,
            };

            if (v.id) {
              return tx.productVariant.update({
                where: { id: v.id },
                data: variantPayload,
              });
            } else {
              return tx.productVariant.create({
                data: {
                  ...variantPayload,
                  productId,
                },
              });
            }
          },
        );

        await Promise.all(variantPromises);

        return product;
      },
      {
        timeout: 10000, // Wait up to 10s for individual ops
        maxWait: 5000, // Wait up to 5s to get a connection
      },
    );

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath(`/product/${result.slug}`);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = (error.meta?.target as string[]) || [];
      if (target.includes("slug")) {
        return { 
          success: false, 
          error: "A product with this URL (slug) already exists. Please use a different one." 
        };
      }
    }
    const message = error instanceof Error ? error.message : "An unknown error occurred while updating the product.";
    return { success: false, error: `Failed to update product: ${message}` };
  }
}

/**
 * Delete a product image from DB and Cloudinary
 */
export async function deleteProductImage(imageId: string) {
  try {
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: { product: true },
    });

    if (!image) return { success: false, error: "Image not found" };

    if (image.publicId && image.url.includes("blob.vercel-storage.com")) {
      await del(image.url, { token: BLOB_TOKEN });
    }

    await prisma.productImage.delete({
      where: { id: imageId },
    });

    revalidatePath(`/product/${image.product.slug}`);
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteProductImage:", error);
    return { success: false, error: "Failed to delete image" };
  }
}

// ---------------------------------------------------------
// NEW: Dashboard Quick Actions
// ---------------------------------------------------------

/**
 * Toggle product visibility status
 */
export async function toggleProductStatus(
  productId: string,
  isVisible: boolean,
) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isVisible },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error toggling product status:", error);
    const message = error instanceof Error ? error.message : "Database update failed";
    return { success: false, error: `Failed to update status: ${message}` };
  }
}

/**
 * Toggle product featured status
 */
export async function toggleProductFeatured(
  productId: string,
  isFeatured: boolean,
) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isFeatured },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Error toggling product featured:", error);
    return { success: false, error: "Failed to update featured status" };
  }
}

/**
 * Duplicate a product (Variants included, Images excluded based on decision)
 */
export async function duplicateProduct(productId: string) {
  try {
    // 1. Fetch original product with variants
    const original = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!original) return { success: false, error: "Product not found" };

    // 2. Prepare Variant Data (Excluding IDs)
    const variantsData = original.variants.map((v) => ({
      sizeNameAr: v.sizeNameAr,
      sizeNameEn: v.sizeNameEn,
      detailedSizeAr: v.detailedSizeAr,
      detailedSizeEn: v.detailedSizeEn,
      colorAr: v.colorAr,
      colorEn: v.colorEn,
      price: v.price,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      discountPrice: (v as any).discountPrice,
      stock: v.stock,
      sku: `${v.sku}-COPY-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      isDefault: v.isDefault,
      sortOrder: v.sortOrder,
      showPrice: v.showPrice,
    }));

    // 3. Create new product
    const newProduct = await prisma.product.create({
      data: {
        nameEn: `${original.nameEn} (Copy)`,
        nameAr: `${original.nameAr} (نسخة)`,
        slug: `${original.slug}-copy-${Date.now()}`,
        descEn: original.descEn,
        descAr: original.descAr,
        categoryId: original.categoryId,
        isVisible: false, // Default to hidden
        isFeatured: false,

        // Copy technical specs
        materialAr: original.materialAr,
        materialEn: original.materialEn,
        madeInAr: original.madeInAr,
        madeInEn: original.madeInEn,
        warrantyAr: original.warrantyAr,
        warrantyEn: original.warrantyEn,
        installmentInfoAr: original.installmentInfoAr,
        installmentInfoEn: original.installmentInfoEn,
        deliveryInstallationAr: original.deliveryInstallationAr,
        deliveryInstallationEn: original.deliveryInstallationEn,
        recommendedSize: original.recommendedSize,

        // Copy variants
        variants: {
          create: variantsData,
        },
      },
    });

    revalidatePath("/admin/products");
    return { success: true, data: newProduct };
  } catch (error) {
    console.error("Error duplicating product:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = (error.meta?.target as string[]) || [];
      if (target.includes("slug")) {
        return { 
          success: false, 
          error: "A product with this URL (slug) already exists. Duplicate failed due to slug collision." 
        };
      }
    }
    const message = error instanceof Error ? error.message : "Duplicate failed";
    return { success: false, error: `Failed to duplicate product: ${message}` };
  }
}
/**
 * Set an image as the main image for a product
 */
export async function setProductMainImage(imageId: string, productId: string) {
  try {
    // Start a transaction to ensure data consistency
    await prisma.$transaction([
      // 1. Set all images for this product to isMain: false
      prisma.productImage.updateMany({
        where: { productId },
        data: { isMain: false },
      }),
      // 2. Set the selected image to isMain: true
      prisma.productImage.update({
        where: { id: imageId },
        data: { isMain: true },
      }),
    ]);

    revalidatePath(`/product`);
    revalidatePath(`/admin/products`);
    revalidatePath(`/admin/products/${productId}/images`);
    return { success: true };
  } catch (error) {
    console.error("Error setting main product image:", error);
    return { success: false, error: "Failed to set main product image" };
  }
}

/**
 * Delete a product completely from the database and storage
 */
export async function deleteProduct(productId: string) {
  try {
    // 1. Fetch product with images to handle storage cleanup
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        images: true,
      },
    });

    if (!product) return { success: false, error: "Product not found" };

    // 2. Delete images from Vercel Blob
    for (const image of product.images) {
      if (image.url && (image.url.includes("blob.vercel-storage.com") || image.publicId)) {
        try {
          // Use del() from @vercel/blob
          await del(image.url, { token: BLOB_TOKEN });
        } catch (err) {
          console.error(`Failed to delete blob image: ${image.url}`, err);
          // Continue with other images and DB deletion even if one blob delete fails
        }
      }
    }

    // 3. Database Deletion in Transaction
    await prisma.$transaction(async (tx) => {
      // A. Manual cleanup for relations without Cascade Delete (if any)
      // CartItem has NoAction on Product in the schema, so we should clean it up
      await tx.cartItem.deleteMany({
        where: { productId },
      });

      // B. Delete the main product record 
      // This will cascade to ProductImage, ProductVariant, WhatsAppOrder, Review, and ProductCollectionItem 
      // as they are marked with onDelete: Cascade in the Prisma schema.
      await tx.product.delete({
        where: { id: productId },
      });
    }, {
      timeout: 10000,
      maxWait: 5000,
    });

    // 4. Revalidate cache
    revalidatePath("/");
    revalidatePath("/product");
    revalidatePath("/admin/products");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    const message = error instanceof Error ? error.message : "Database deletion failed";
    return { success: false, error: `Failed to delete product: ${message}` };
  }
}
