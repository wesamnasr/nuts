"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PortfolioCategoryWithItems } from "@/actions/portfolio";
import { PortfolioGrid } from "./PortfolioGrid";

import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";

interface PortfolioScrollLayoutProps {
  categories: PortfolioCategoryWithItems[];
}

export function PortfolioScrollLayout({ categories }: PortfolioScrollLayoutProps) {
  const { locale, dir } = useLocale();
  const isRtl = dir === "rtl";
  const isAr = locale === "ar";
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // null = "All"
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Handle intersection observer only when NOT in filter mode
  useEffect(() => {
    if (isFilterActive) return;

    const observers = categories.map((cat) => {
      const element = document.getElementById(`category-${cat.id}`);
      if (!element) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setActiveCategory(cat.id);
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [categories, isFilterActive]);

  const selectCategory = (id: string | null) => {
    if (id === null) {
      setIsFilterActive(false);
      setActiveCategory(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setIsFilterActive(true);
      setActiveCategory(id);
      // Optional: scroll to the top of the grid view
      window.scrollTo({ top: 400, behavior: "smooth" });
    }
  };

  const filteredCategory = categories.find(c => c.id === activeCategory);

  return (
    <div className="relative min-h-screen">
      {/* Sticky Navigation (Small Floating Glass Pill) */}
      <div className="sticky top-0 z-40 py-2 md:py-4 transition-all duration-500">
        <div className="w-[95%] max-w-[2000px] mx-auto px-2 md:px-4">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 p-1 bg-white/60 backdrop-blur-2xl border border-white/40 rounded-full shadow-xl shadow-neutral-200/50 overflow-x-auto no-scrollbar max-w-full">
              {/* All Option */}
              <button
                onClick={() => selectCategory(null)}
                className={cn(
                    "px-4 md:px-5 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap",
                    activeCategory === null
                    ? "bg-primary text-white shadow-md scale-105"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-white/30"
                )}
              >
                {isAr ? "الكل" : "All"}
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  className={cn(
                    "px-4 md:px-5 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap",
                    activeCategory === category.id
                      ? "text-white shadow-md scale-105"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-white/30"
                  )}
                  style={{
                    backgroundColor: activeCategory === category.id ? category.accentColor || "#d8a868" : undefined,
                    fontFamily: category.fontFamily || "inherit"
                  }}
                >
                  {locale === "ar" ? category.titleAr : category.titleEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-[90%] max-w-[2000px] mx-auto px-4 py-8 relative">
        <AnimatePresence mode="wait">
          {!isFilterActive ? (
            <motion.div 
               key="full-scroll"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="space-y-20"
            >
              {categories.map((category) => (
                <section 
                  key={category.id} 
                  id={`category-${category.id}`} 
                  className="scroll-mt-32 relative overflow-visible"
                >
                    {/* Header Component */}
                    <CategoryHeader category={category} isRtl={isRtl} isAr={isAr} locale={locale} />
                    
                    <PortfolioGrid 
                        items={category.items} 
                        accentColor={category.accentColor || "#d8a868"}
                        categoryName={locale === "ar" ? category.titleAr : category.titleEn}
                    />
                </section>
              ))}
            </motion.div>
          ) : (
             <motion.div
                key={activeCategory || "filtered"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-12 py-10"
             >
                {filteredCategory && (
                    <>
                        <CategoryHeader category={filteredCategory} isRtl={isRtl} isAr={isAr} locale={locale} compact />
                        <PortfolioGrid 
                            items={filteredCategory.items} 
                            accentColor={filteredCategory.accentColor || "#d8a868"}
                            categoryName={locale === "ar" ? filteredCategory.titleAr : filteredCategory.titleEn}
                        />
                    </>
                )}
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Sub-component for Cleaner Layout
function CategoryHeader({ category, isRtl, isAr, locale, compact = false }: { category: PortfolioCategoryWithItems, isRtl: boolean, isAr: boolean, locale: string, compact?: boolean }) {
    return (
        <div className={cn("mb-12", compact && "mb-8")}>
            <div className={cn(
                "relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group/header transition-all duration-700",
                compact ? "h-[200px] md:h-[250px]" : "h-auto"
            )}>
                {category.coverImage ? (
                    <div className="absolute inset-0 transition-transform duration-1000 group-hover/header:rotate-1">
                        <Image 
                            src={category.coverImage} 
                            alt="Cover" 
                            fill
                            className="object-cover opacity-40 blur-[1px]" 
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-neutral-900/60 via-neutral-900/40 to-neutral-900/80" />
                    </div>
                ) : (
                    <div 
                        className="absolute inset-0"
                        style={{ backgroundColor: category.accentColor || "#171717" }}
                    />
                )}

                <div className={cn("relative z-10 flex flex-col md:flex-row gap-8 items-center",
                    compact ? "p-6 md:p-8" : "p-8 md:p-12",
                    !category.coverImage && "text-white"
                )}>
                    {category.logo && (
                        <div className="shrink-0 relative">
                            <div className="absolute -inset-3 bg-white/15 blur-xl rounded-full" />
                            <div className={cn(
                                "relative bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 transition-transform duration-500 group-hover/header:scale-105",
                                compact ? "w-20 h-20 md:w-24 md:h-24" : "w-24 h-24 md:w-32 md:h-32"
                            )}>
                                <Image 
                                    src={category.logo} 
                                    alt="Logo" 
                                    fill
                                    className="object-contain p-4" 
                                />
                            </div>
                        </div>
                    )}
                    
                    <div className={cn(
                        "space-y-4 flex-1",
                        isRtl ? "text-right" : "text-left"
                    )}>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 drop-shadow-sm">
                                {isAr ? "مجموعة مميزة" : "Featured Collection"}
                            </span>
                            <h2 
                                className={cn(
                                    "font-black text-white leading-tight tracking-tight",
                                    compact ? "text-2xl md:text-3xl" : "text-3xl md:text-5xl lg:text-5xl"
                                )}
                                style={{ fontFamily: category.fontFamily || "inherit" }}
                            >
                                {locale === "ar" ? category.titleAr : category.titleEn}
                            </h2>
                        </div>
                        
                        {!compact && (category.descriptionAr || category.descriptionEn) && (
                            <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl font-light">
                                {locale === "ar" ? category.descriptionAr : category.descriptionEn}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
