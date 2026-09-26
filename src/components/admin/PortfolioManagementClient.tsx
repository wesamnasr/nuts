"use client";

import { useState } from "react";
import { PortfolioCategoriesClient } from "./PortfolioCategoriesClient";
import { PortfolioConfigForm } from "./PortfolioConfigForm";
import { Layers, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";
import type { ComponentProps } from "react";

type PortfolioCategory = ComponentProps<typeof PortfolioCategoriesClient>["categories"][number];

interface PortfolioConfig {
  heroTitleAr?: string;
  heroTitleEn?: string;
  heroDescAr?: string;
  heroDescEn?: string;
  showStats?: boolean;
  stats?: string | { id: number; value: string; labelAr: string; labelEn: string }[];
}

interface PortfolioManagementClientProps {
  categories: PortfolioCategory[];
  config: PortfolioConfig | null;
}


export function PortfolioManagementClient({ categories, config: rawConfig }: PortfolioManagementClientProps) {
    const config: PortfolioConfig = rawConfig ?? {};
    const [activeTab, setActiveTab] = useState<"categories" | "settings">("categories");
    const { t } = useLocale();

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header / Tab Switcher */}
            <div className="bg-white border-b sticky top-0 z-30 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 pb-0">
                 <div className="container mx-auto space-y-4 sm:space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 tracking-tight font-playfair uppercase">
                              {t("portfolioManager")}
                            </h1>
                            <p className="text-[10px] sm:text-sm text-neutral-500 font-medium opacity-80 uppercase tracking-widest">
                              {t("portfolioManagerSubtitle")}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 sm:gap-8 overflow-x-auto scrollbar-hide -mb-px">
                         <button
                            onClick={() => setActiveTab("categories")}
                            className={cn(
                                "pb-4 px-1 flex items-center gap-2 text-xs sm:text-base font-black uppercase tracking-tight transition-all relative whitespace-nowrap",
                                activeTab === "categories" 
                                    ? "text-primary border-b-2 border-primary" 
                                    : "text-neutral-400 hover:text-neutral-900"
                            )}
                         >
                            <Layers className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            <span>{t("categoriesAndItems")}</span>
                         </button>

                         <button
                            onClick={() => setActiveTab("settings")}
                            className={cn(
                                "pb-4 px-1 flex items-center gap-2 text-xs sm:text-base font-black uppercase tracking-tight transition-all relative whitespace-nowrap",
                                activeTab === "settings" 
                                    ? "text-primary border-b-2 border-primary" 
                                    : "text-neutral-400 hover:text-neutral-900"
                            )}
                         >
                            <LayoutTemplate className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            <span>{t("pageContentAndStats")}</span>
                         </button>
                    </div>
                 </div>
            </div>

            <div className="container mx-auto px-4 md:px-8">
                {activeTab === "categories" ? (
                    <PortfolioCategoriesClient categories={categories} />
                ) : (
                    <PortfolioConfigForm initialConfig={config} />
                )}
            </div>
        </div>
    );
}
