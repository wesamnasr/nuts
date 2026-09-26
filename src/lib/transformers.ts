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
  colorAr: string;
  colorEn: string;
  sizeAr: string;
  sizeEn: string;
  categoryId: string;
  category: { id: string; nameAr: string; nameEn: string; slug: string };
  isFeatured: boolean;
  isOnSale: boolean;
  startingPrice: number;
  showPrice: boolean;
  isVisible: boolean;
  stock: number;
  images: Array<{ url: string; altText: string | null }>;
  _count: { images: number; whatsAppOrders: number };
  createdAt: Date;
  updatedAt: Date;
};

export interface RawProduct {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  variants?: {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    price: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    discountPrice: any;
    colorAr?: string | null;
    colorEn?: string | null;
    sizeNameAr?: string | null;
    sizeAr?: string | null;
    sizeNameEn?: string | null;
    sizeEn?: string | null;
    showPrice?: boolean;
    stock?: number;
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
  isFeatured?: boolean;
  isVisible?: boolean;
  _count?: { images: number; whatsAppOrders: number };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Standardizes a product object from DB into the format expected by storefront components.
 */
export function transformProduct(p: RawProduct): StorefrontProduct {
  const variant = p.variants?.[0];
  const price = Number(variant?.price) || 0;
  const discountPrice = variant?.discountPrice
    ? Number(variant.discountPrice)
    : null;

  const hasDiscount =
    discountPrice !== null && discountPrice > 0 && discountPrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - discountPrice!) / price) * 100)
    : 0;

  return {
    id: p.id,
    variantId: variant?.id || "",
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    slug: p.slug,
    image: p.images?.[0]?.url || "https://placehold.co/800x600?text=No+Image",
    altText: p.images?.[0]?.altText || p.nameEn,
    price,
    discountPrice: hasDiscount ? discountPrice : null,
    discountPercent,
    colorAr: variant?.colorAr || "",
    colorEn: variant?.colorEn || "",
    sizeAr: variant?.sizeNameAr || variant?.sizeAr || "",
    sizeEn: variant?.sizeNameEn || variant?.sizeEn || "",
    categoryId: p.categoryId,
    category: p.category || { id: "", nameAr: "", nameEn: "", slug: "" },
    isFeatured: p.isFeatured || false,
    isOnSale: hasDiscount,
    startingPrice: discountPrice || price,
    showPrice: variant?.showPrice ?? true,
    stock: variant?.stock ?? 0,
    isVisible: p.isVisible || false,
    images: (p.images || []).map((img) => ({
      url: img.url,
      altText: img.altText ?? null,
    })),
    _count: p._count || { images: 0, whatsAppOrders: 0 },
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
