"use client";

import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { type StorefrontProduct } from "@/lib/transformers";

interface SimilarProductsProps {
  products: StorefrontProduct[];
  categoryId: string;
}

export function SimilarProducts({ products, categoryId }: SimilarProductsProps) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-neutral-50/30">
      <div className="w-[90%] max-w-[2000px] mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold font-serif text-neutral-900">
            {t("similarProducts")}
          </h2>
          <Link href={`/shop?category=${categoryId}`}>
            <Button variant="outline" className="gap-2 hidden md:flex">
                {t("viewAll")} 
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </Link>
        </div>

        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex-none w-[280px] md:w-[320px] snap-center"
              >
                <div className="h-full">
                    <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center md:hidden">
            <Link href={`/shop?category=${categoryId}`}>
                <Button variant="outline" className="w-full gap-2">
                {t("viewAll")}
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
            </Link>
        </div>
      </div>
    </section>
  );
}
