"use client";

import { ProductCarousel } from "@/components/ui/ProductCarousel";
import { useLocale } from "@/i18n/LocaleContext";

import { type StorefrontProduct as Product } from "@/lib/transformers";

export function BestSellers({ products }: { products: Product[] }) {
  const { t } = useLocale();

  return (
    <ProductCarousel
      products={products}
      title={t("bestSellers")}
      description={t("bestSellersDesc")}
      badge="HOT"
      viewAllLink="/shop?sort=best_selling"
    />
  );
}
