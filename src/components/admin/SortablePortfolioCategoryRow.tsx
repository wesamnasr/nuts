"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { Layers, Edit2, Eye, EyeOff, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";

interface PortfolioCategory {
  id: string;
  titleEn: string;
  titleAr: string;
  accentColor: string | null;
  fontFamily: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { items: number };
}

interface SortablePortfolioCategoryRowProps {
  category: PortfolioCategory;
}

export function SortablePortfolioCategoryRow({ category }: SortablePortfolioCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const { t, locale, dir } = useLocale();
  const isRtl = dir === "rtl";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? "relative" as const : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "hover:bg-neutral-50 transition-colors group bg-white",
        isDragging && "shadow-lg opacity-80 bg-neutral-50"
      )}
    >
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div 
            {...attributes} 
            {...listeners}
            className="flex items-center gap-2 text-neutral-400 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm font-medium">{category.sortOrder}</span>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-bold text-neutral-900">
            {locale === "ar" ? category.titleAr : category.titleEn}
          </span>
          <span className="text-[10px] sm:text-xs text-neutral-500">
            {locale === "ar" ? category.titleEn : category.titleAr}
          </span>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <span className="text-xs sm:text-sm text-neutral-600 font-medium">
          {category._count.items} {t("productsFound")}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border shadow-sm"
            style={{ backgroundColor: category.accentColor || "#d8a868" }}
          />
          <span className="text-[10px] sm:text-xs text-neutral-500 font-mono">
            {category.accentColor}
          </span>
        </div>
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-center">
        {category.isActive ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800">
            <Eye className={cn("h-3 w-3", isRtl ? "ml-1" : "mr-1")} />
            {t("badgeVisible")}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-neutral-100 text-neutral-600">
            <EyeOff className={cn("h-3 w-3", isRtl ? "ml-1" : "mr-1")} />
            {t("badgeHidden")}
          </span>
        )}
      </td>
      <td
        className={cn(
          "px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium",
          isRtl ? "text-left" : "text-right"
        )}
      >
        <div className="flex items-center justify-end gap-1 sm:gap-2 text-neutral-400">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:text-primary hover:bg-primary/5 rounded-lg"
          >
            <NextLink href={`/admin/portfolio/${category.id}/items`}>
              <Layers className="h-4 w-4" />
              <span className="sr-only">Items</span>
            </NextLink>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 sm:h-9 sm:w-9 p-0 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
          >
            <NextLink href={`/admin/portfolio/${category.id}/edit`}>
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </NextLink>
          </Button>
        </div>
      </td>
    </tr>
  );
}
