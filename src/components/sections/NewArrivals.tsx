"use client";

import { ProductCarousel } from "@/components/ui/ProductCarousel";
import { useLocale } from "@/i18n/LocaleContext";

import { type StorefrontProduct as Product } from "@/lib/transformers";

export function NewArrivals({ products }: { products: Product[] }) {
  const { t } = useLocale();

  return (
    <ProductCarousel
      products={products}
      title={t("newArrivals")}
      description={t("newArrivalsDesc")}
      badge="NEW"
      viewAllLink="/shop?sort=newest"
    />
  );
}
