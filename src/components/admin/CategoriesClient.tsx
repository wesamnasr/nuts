"use client";

import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import {
  Layers,
  Plus,
  Edit2,
  Eye,
  EyeOff,
  GripVertical
} from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { products: number };
}

interface CategoriesClientProps {
  categories: Category[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const { t, locale, dir } = useLocale();
  const isRtl = dir === "rtl";

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 sm:pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-neutral-900 font-playfair uppercase">
            {t("categoriesTitle")}
          </h1>
          <p className="text-neutral-500 text-xs sm:text-sm font-medium opacity-80">
            {t("categoriesSubtitle")}
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto bg-[#FF7F11] hover:bg-[#e56e00] text-white rounded-xl sm:rounded-2xl h-12 sm:h-14 px-6 sm:px-8 font-black uppercase tracking-tight shadow-xl shadow-[#FF7F11]/30 transition-all active:scale-[0.98]">
          <NextLink href="/admin/categories/new" className="flex items-center justify-center gap-2">
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
            {t("addNewCategory")}
          </NextLink>
        </Button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar scroll-smooth">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-[800px] w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className={cn(
                    "px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider w-16 sm:w-20",
                    isRtl ? "text-right" : "text-left"
                  )}>{t("columnOrder")}</th>
                  <th className={cn(
                    "px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider",
                    isRtl ? "text-right" : "text-left"
                  )}>{t("columnCategoryName")}</th>
                  <th className={cn(
                    "px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider",
                    isRtl ? "text-right" : "text-left"
                  )}>{t("columnProducts")}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider">{t("columnStatus")}</th>
                  <th className={cn(
                    "px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider",
                    isRtl ? "text-left" : "text-right"
                  )}>{t("columnActions")}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 cursor-move opacity-50 group-hover:opacity-100" />
                        <span className="text-xs sm:text-sm font-medium">{category.sortOrder}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl overflow-hidden border border-neutral-100 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={category.image || "https://placehold.co/100x100"}
                            alt={locale === "ar" ? category.nameAr : category.nameEn}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/100x100"; }}
                          />
                        </div>
                        <div className={isRtl ? "mr-3 sm:mr-4" : "ml-3 sm:ml-4"}>
                          <div className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-primary transition-colors">{locale === "ar" ? category.nameAr : category.nameEn}</div>
                          <div className="text-[10px] sm:text-xs text-neutral-400 font-medium">{locale === "ar" ? category.nameEn : category.nameAr}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm text-neutral-600 font-medium">
                        {category._count.products} <span className="opacity-60">{t("columnProducts")}</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
                      {category.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <Eye className={cn("h-2.5 w-2.5 sm:h-3 sm:w-3", isRtl ? "ml-1" : "mr-1")} />
                          {t("badgeVisible")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 rounded-full text-[10px] sm:text-xs font-bold bg-neutral-50 text-neutral-400 border border-neutral-100">
                          <EyeOff className={cn("h-2.5 w-2.5 sm:h-3 sm:w-3", isRtl ? "ml-1" : "mr-1")} />
                          {t("badgeHidden")}
                        </span>
                      )}
                    </td>
                    <td className={cn(
                      "px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium",
                      isRtl ? "text-left" : "text-right"
                    )}>
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 sm:h-9 sm:w-9 text-neutral-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
                        <NextLink href={`/admin/categories/${category.id}/edit`}>
                          <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </NextLink>
                      </Button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-400">
                      <Layers className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 opacity-10" />
                      <p className="text-sm font-medium">{t("noCategoriesFound")}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
