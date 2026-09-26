"use client";

import { ProductCarousel } from "@/components/ui/ProductCarousel";
import { useLocale } from "@/i18n/LocaleContext";

import { type StorefrontProduct as Product } from "@/lib/transformers";

interface GenericProductSectionProps {
    products: Product[];
    titleAr: string;
    titleEn: string; 
}

export function GenericProductSection({ products, titleAr, titleEn }: GenericProductSectionProps) {
  const { locale } = useLocale();

  if (!products || products.length === 0) return null;

  return (
    <ProductCarousel
      products={products}
      title={locale === "ar" ? titleAr : titleEn}
      description="" 
    />
  );
}
