"use client";

import { cn } from "@/lib/utils";
import { PortfolioCategory } from "@prisma/client";

interface PortfolioFilterProps {
  categories: PortfolioCategory[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  locale: "ar" | "en";
}

export function PortfolioFilter({
  categories,
  activeCategoryId,
  onSelectCategory,
  locale,
}: PortfolioFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex gap-4 min-w-max px-4 md:justify-center">
        {/* 'All' Option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "flex flex-col items-center gap-2 transition-all duration-500 group shrink-0",
            activeCategoryId === null ? "scale-105" : "opacity-70 hover:opacity-100"
          )}
        >
          <div
            className={cn(
              "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center transition-all duration-500 shadow-lg shadow-neutral-200/50",
              activeCategoryId === null
                ? "border-primary bg-linear-to-br from-primary to-primary/80 text-white ring-2 ring-primary/10 rotate-3"
                : "border-white bg-white/40 backdrop-blur-xl group-hover:border-primary/30 group-hover:-rotate-3"
            )}
          >
            <span className="font-black text-[8px] sm:text-[9px] uppercase tracking-widest px-1 text-center">
              {locale === "ar" ? "الكل" : "All"}
            </span>
          </div>
        </button>

        {/* Categories */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex flex-col items-center gap-2 transition-all duration-500 group shrink-0",
              activeCategoryId === category.id ? "scale-105" : "opacity-70 hover:opacity-100"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center transition-all duration-500 shadow-lg shadow-neutral-200/50",
                activeCategoryId === category.id
                  ? "text-white ring-2 ring-primary/10 rotate-3"
                  : "bg-white/40 backdrop-blur-xl border-white group-hover:border-primary/30 group-hover:-rotate-3"
              )}
              style={{
                backgroundColor:
                  activeCategoryId === category.id
                    ? category.accentColor || "#d8a868"
                    : undefined,
                borderColor:
                  activeCategoryId === category.id
                    ? category.accentColor || "#d8a868"
                    : undefined,
              }}
            >
              <span
                className="font-black text-[7px] sm:text-[9px] px-1 text-center leading-tight line-clamp-2 uppercase tracking-tight"
                style={{ 
                    fontFamily: category.fontFamily || "inherit",
                    color: activeCategoryId === category.id ? "white" : "inherit"
                }}
              >
                {locale === "ar" ? category.titleAr : category.titleEn}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
