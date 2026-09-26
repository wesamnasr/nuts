"use client";

import { ProductDataTable } from "@/components/admin/ProductDataTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NextLink from "next/link";
import { Suspense } from "react";
import { useLocale } from "@/i18n/LocaleContext";

interface AdminProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  categoryId: string;
  isVisible: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  startingPrice: number;
  images: { url: string; altText: string | null }[];
  category: { id: string; nameEn: string; nameAr: string };
  updatedAt: Date;
  _count?: { images: number };
}

interface ProductsClientProps {
  products: AdminProduct[];
  total: number;
  totalPages: number;
  page: number;
}

export function ProductsClient({ products, total, totalPages, page }: ProductsClientProps) {
  const { t, locale } = useLocale();

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-neutral-900 font-playfair uppercase">
            {t("productManagement")}
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm font-medium opacity-80">
            {t("productManagementSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild className="w-full sm:w-auto bg-[#FF7F11] hover:bg-[#e56e00] text-white rounded-xl sm:rounded-2xl h-12 sm:h-14 px-6 sm:px-8 font-black uppercase tracking-tight shadow-xl shadow-[#FF7F11]/30 transition-all active:scale-[0.98]">
            <NextLink href="/admin/products/new" className="flex items-center justify-center gap-2">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              {t("addNewProduct")}
            </NextLink>
          </Button>
        </div>
      </div>

      <Suspense fallback={<div>{locale === "ar" ? "جاري تحميل المنتجات..." : "Loading products..."}</div>}>
        <ProductDataTable 
          initialProducts={products} 
          total={total} 
          totalPages={totalPages} 
          currentPage={page} 
        />
      </Suspense>
    </div>
  );
}
