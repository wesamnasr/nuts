"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { ProductGrid } from "@/components/ui/ProductGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type StorefrontProduct } from "@/lib/transformers";




export function ShopClient({
  initialProducts,
  categories,
  collections,
  initialSortBy = "featured",
  activeCollectionId,
  flashSaleEndDate,
}: {
  initialProducts: StorefrontProduct[];
  categories: { id: string; nameAr: string; nameEn: string; slug: string }[];
  collections: { id: string; titleAr: string; titleEn: string }[];
  initialSortBy?: string;
  activeCollectionId?: string;
  flashSaleEndDate?: Date;
}) {
  const { locale, t } = useLocale();
  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initial values from URL
  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  // local state for interactivity
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSortBy || "featured");

  // Update URL function
  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/shop?${params.toString()}`);
  }, [searchParams, router]);

  // Debounced Search Sync
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== initialSearch) {
        updateUrl({ search: searchQuery });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, initialSearch, updateUrl]);

  const products = useMemo(() => {
    return initialProducts.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
    }));
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    const result = [...products];

    // Client-side Sort
    if (sortBy === "price-low") {
      result.sort(
        (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)
      );
    } else if (sortBy === "price-high") {
      result.sort(
        (a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price)
      );
    } else if (sortBy === "newest") {
      result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === "best_selling") {
      result.sort(
        (a, b) => ((b._count?.orderItems || 0) + (b.isBestSeller ? 100 : 0)) - ((a._count?.orderItems || 0) + (a.isBestSeller ? 100 : 0))
      );
    } else {
      // featured
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [products, sortBy]); // Removed filtered by category/search locally as server handles it. 
  // Wait, if I remove local filter, and I type in search box, the list won't update until server responds (500ms + RTT).
  // For better UX, keeping local filter "intersecting" with text is okay, but purely string match.
  // Actually, if I rely on server, I should rely on server. 
  // But for Search, immediate feedback is nice. 
  // However, since we now fetch specific subsets, client filter might be "too strict" if it filters what's visible.
  // Example: "Chairs" fetched. I type "Red". Client filter hides non-red.
  // Server fetches "Red Chairs".
  // This is consistent.
  // But if I change Category from Chairs to Tables. 
  // I call updateUrl({category: 'tables'}).
  // 'selectedCategory' becomes 'tables'.
  // 'initialProducts' are still Chairs (until load).
  // Client filter: `p.category.slug === 'tables'`.
  // Result: Empty (since only Chairs are present).
  // This is fine, shows loading state effectively.

  // Re-adding client filter for "transient" states and sorting
  /* 
     Actually, if I stick to server-side filtering, I should strictly trust `products`.
     Use `filteredProducts` ONLY for sorting.
     UNLESS I want "instant" search feedback on the loaded 100 items.
     Let's Keep it simple: Trust server data, only sort locally.
  */

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 pt-24 sm:pt-32 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-12 sm:mb-20 text-center space-y-4">
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black text-neutral-900 tracking-tight">
              {t("shop")}
            </h1>
            <p className="text-sm sm:text-lg text-neutral-500 max-w-2xl mx-auto font-medium">
              {isAr ? "استكشف مجموعتنا الواسعة من الأثاث الكلاسيكي والراقي المصمم خصيصاً لمنزلك." : "Explore our wide collection of vintage and elegant furniture designed specifically for your home."}
            </p>
          </div>

          {/* Collections Filter Strip */}
          <div className="mb-12 overflow-hidden">
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              <Badge
                variant={!activeCollectionId ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-4 py-2 sm:px-6 sm:py-2.5 rounded-full whitespace-nowrap text-[10px] sm:text-sm font-bold transition-all shadow-sm",
                  !activeCollectionId ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-900 hover:text-neutral-900"
                )}
                onClick={() => updateUrl({ collection: null })}
              >
                {isAr ? "كل المنتجات" : "All Products"}
              </Badge>
              {collections.map((col) => (
                <Badge
                  key={col.id}
                  variant={activeCollectionId === col.id ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 sm:px-6 sm:py-2.5 rounded-full whitespace-nowrap text-[10px] sm:text-sm font-bold transition-all shadow-sm",
                    activeCollectionId === col.id ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-900 hover:text-neutral-900"
                  )}
                  onClick={() => {
                    if (activeCollectionId === col.id) {
                      updateUrl({ collection: null });
                    } else {
                      updateUrl({ collection: col.id });
                    }
                  }}
                >
                  {isAr ? col.titleAr : col.titleEn}
                </Badge>
              ))}
            </div>
          </div>

          {/* Controls - Sticky Header Refined */}
          <div className="sticky top-16 sm:top-24 z-40 bg-white/80 backdrop-blur-xl p-2.5 sm:p-6 rounded-xl sm:rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-neutral-100 mb-6 sm:mb-16">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center justify-between">
              {/* Search */}
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-neutral-400" />
                <Input
                  placeholder={t("search")}
                  className="pl-9 h-9 sm:h-12 rounded-lg sm:rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium text-xs sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters & Sort */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full lg:w-auto items-center">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar w-full sm:w-auto -mx-1 px-1 sm:mx-0 sm:px-0">
                  <button
                    className={cn(
                      "px-3 py-1.5 rounded-lg sm:rounded-xl whitespace-nowrap text-[10px] sm:text-sm font-bold transition-all",
                      selectedCategory === "all" ? "bg-primary/10 text-primary" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
                    )}
                    onClick={() => updateUrl({ category: null })}
                  >
                    {isAr ? "الكل" : "All"}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={cn(
                        "px-3 py-1.5 rounded-lg sm:rounded-xl whitespace-nowrap text-[10px] sm:text-sm font-bold transition-all",
                        selectedCategory === cat.slug ? "bg-primary/10 text-primary" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
                      )}
                      onClick={() => updateUrl({ category: cat.slug })}
                    >
                      {isAr ? cat.nameAr : cat.nameEn}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 ml-auto sm:ml-0 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-neutral-100 pt-2.5 sm:pt-0 sm:pl-6">
                  <SlidersHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-neutral-400 shrink-0" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[200px] h-9 sm:h-11 rounded-lg sm:rounded-xl border-neutral-100 bg-neutral-50/50 font-bold text-[10px] sm:text-sm">
                      <SelectValue placeholder={t("sortBy")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured" className="rounded-lg sm:rounded-xl">{isAr ? "المميزة" : "Featured"}</SelectItem>
                      <SelectItem value="best_selling" className="rounded-lg sm:rounded-xl">{isAr ? "الأكثر مبيعاً" : "Best Selling"}</SelectItem>
                      <SelectItem value="newest" className="rounded-lg sm:rounded-xl">{isAr ? "الأحدث" : "Newest"}</SelectItem>
                      <SelectItem value="price-low" className="rounded-lg sm:rounded-xl">{t("priceLowHigh")}</SelectItem>
                      <SelectItem value="price-high" className="rounded-lg sm:rounded-xl">{t("priceHighLow")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-8 flex items-center justify-between">
            <div className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
              {filteredProducts.length} {t("resultsFound")}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <ProductGrid
              products={filteredProducts}
              showFlashSale={activeCollectionId === 'special-offers'}
              flashSaleEndDate={flashSaleEndDate}
            />
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 shadow-sm">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-neutral-50 mb-4">
                <Search className="h-8 w-8 text-neutral-200" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">{t("noProductsFound")}</h3>
              <p className="text-neutral-500 mt-2">{isAr ? "جرب البحث بكلمات مختلفة أو تغيير الفئة." : "Try searching with different keywords or changing the category."}</p>
              <Button
                variant="link"
                className="mt-4 text-[#d8a868]"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
              >
                {isAr ? "إعادة تعيين الكل" : "Reset all filters"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
