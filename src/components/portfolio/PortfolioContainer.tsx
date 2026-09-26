"use client";

import { useState } from "react";
import { type PortfolioCategory, type PortfolioItem } from "@prisma/client";
import { PortfolioFilter } from "./PortfolioFilter";
import { PortfolioGrid } from "./PortfolioGrid";
import { useLocale } from "@/i18n/LocaleContext";

type CategoryWithItems = PortfolioCategory & {
  items: PortfolioItem[];
};

interface PortfolioContainerProps {
  categories: CategoryWithItems[];
}

export function PortfolioContainer({ categories }: PortfolioContainerProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const { locale } = useLocale();

  // Find the active category
  const activeCategory = activeCategoryId 
    ? categories.find(c => c.id === activeCategoryId)
    : null;

  // Build the list of items to display
  const displayItems = activeCategoryId
    ? (activeCategory?.items || [])
    : categories.flatMap((c) => (c.items || []).map((item: PortfolioItem) => ({ ...item, categoryName: locale === "ar" ? c.titleAr : c.titleEn })));

  // Accent color for the current view
  const currentAccentColor = activeCategory?.accentColor || "#D4AF37";
  
  // Category name for the lightbox
  const currentCategoryName = activeCategory 
    ? (locale === "ar" ? activeCategory.titleAr : activeCategory.titleEn)
    : (locale === "ar" ? "جميع التصميمات" : "All Designs");

  return (
    <section className="py-12 sm:py-20 lg:py-32 bg-white selection:bg-(--accent)/20 overflow-hidden">
        <div className="container mx-auto px-4">
            <PortfolioFilter 
                categories={categories}
                activeCategoryId={activeCategoryId}
                onSelectCategory={setActiveCategoryId}
                locale={locale as "ar" | "en"}
            />

            <div className="mt-10 sm:mt-16 lg:mt-24">
                <PortfolioGrid 
                    items={displayItems} 
                    accentColor={currentAccentColor}
                    categoryName={currentCategoryName}
                />
            </div>
        </div>
    </section>
  );
}
