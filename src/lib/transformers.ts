export type StorefrontProduct = {
  id: string;
  variantId: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  image: string;
  altText: string;
  price: number;
  discountPrice: number | null;
  discountPercent: number;
  weightGram: number;
  flavorAr: string;
  flavorEn: string;
  packageTypeAr: string;
  packageTypeEn: string;
  // UI helper mappings
  sizeAr: string; // e.g. "250 جم"
  sizeEn: string; // e.g. "250g"
  originCountryAr: string;
  originCountryEn: string;
  roastTypeAr: string;
  roastTypeEn: string;
  caloriesPer100g: number | null;
  proteinPer100g: number | null;
  isKeto: boolean;
  isRaw: boolean;
  isOrganic: boolean;
  categoryId: string;
  category: { id: string; nameAr: string; nameEn: string; slug: string };
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  startingPrice: number;
  showPrice: boolean;
  isVisible: boolean;
  stock: number;
  images: Array<{ url: string; altText: string | null }>;
  _count: { images: number; orderItems?: number };
  createdAt: Date;
  updatedAt: Date;
};

export interface RawProduct {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  originCountryAr?: string | null;
  originCountryEn?: string | null;
  roastTypeAr?: string | null;
  roastTypeEn?: string | null;
  caloriesPer100g?: number | null;
  proteinPer100g?: any;
  isKeto?: boolean;
  isRaw?: boolean;
  isOrganic?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isVisible?: boolean;
  variants?: {
    id: string;
    price: any;
    discountPrice?: any;
    weightGram?: number;
    flavorAr?: string | null;
    flavorEn?: string | null;
    packageTypeAr?: string | null;
    packageTypeEn?: string | null;
    stockQuantity?: number;
    stock?: number;
    isDefault?: boolean;
  }[];
  images?: {
    url: string;
    altText?: string | null;
  }[];
  categoryId: string;
  category?: {
    id: string;
    nameAr: string;
    nameEn: string;
    slug: string;
  };
  _count?: { images: number; orderItems?: number; whatsAppOrders?: number };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Standardizes a product object from DB into the format expected by storefront components.
 */
export function transformProduct(p: RawProduct): StorefrontProduct {
  // Find default variant or first variant
  const variant = p.variants?.find((v) => v.isDefault) || p.variants?.[0];
  const price = Number(variant?.price) || 0;
  const discountPrice = variant?.discountPrice
    ? Number(variant.discountPrice)
    : null;

  const hasDiscount =
    discountPrice !== null && discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice!) / price) * 100)
    : 0;

  const weightGram = variant?.weightGram || 250;
  const weightTextAr =
    weightGram >= 1000
      ? `${weightGram / 1000} كجم`
      : `${weightGram} جم`;
  const weightTextEn =
    weightGram >= 1000
      ? `${weightGram / 1000}kg`
      : `${weightGram}g`;

  return {
    id: p.id,
    variantId: variant?.id || "",
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    slug: p.slug,
    image: p.images?.[0]?.url || "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=800&q=80",
    altText: p.images?.[0]?.altText || p.nameEn,
    price,
    discountPrice: hasDiscount ? discountPrice : null,
    discountPercent,
    weightGram,
    flavorAr: variant?.flavorAr || "",
    flavorEn: variant?.flavorEn || "",
    packageTypeAr: variant?.packageTypeAr || "",
    packageTypeEn: variant?.packageTypeEn || "",
    sizeAr: weightTextAr,
    sizeEn: weightTextEn,
    originCountryAr: p.originCountryAr || "",
    originCountryEn: p.originCountryEn || "",
    roastTypeAr: p.roastTypeAr || "",
    roastTypeEn: p.roastTypeEn || "",
    caloriesPer100g: p.caloriesPer100g ?? null,
    proteinPer100g: p.proteinPer100g ? Number(p.proteinPer100g) : null,
    isKeto: p.isKeto ?? false,
    isRaw: p.isRaw ?? false,
    isOrganic: p.isOrganic ?? false,
    categoryId: p.categoryId,
    category: p.category || { id: "", nameAr: "", nameEn: "", slug: "" },
    isFeatured: p.isFeatured || false,
    isBestSeller: p.isBestSeller || false,
    isNewArrival: p.isNewArrival || false,
    isOnSale: hasDiscount,
    startingPrice: discountPrice || price,
    showPrice: true,
    stock: variant?.stockQuantity ?? variant?.stock ?? 10,
    isVisible: p.isVisible ?? true,
    images: (p.images || []).map((img) => ({
      url: img.url,
      altText: img.altText ?? null,
    })),
    _count: {
      images: p._count?.images ?? p.images?.length ?? 0,
      orderItems: p._count?.orderItems ?? 0,
    },
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
