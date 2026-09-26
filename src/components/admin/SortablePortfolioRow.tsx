"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Edit2, Trash2, Video, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { cn } from "@/lib/utils";
import { MediaType } from "@prisma/client";

interface PortfolioItem {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  thumbnailUrl: string | null;
  titleEn: string | null;
  titleAr: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface SortablePortfolioRowProps {
  item: PortfolioItem;
  locale: string;
  isRtl: boolean;
  t: (key: string) => string;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  categoryId: string;
}

export function SortablePortfolioRow({
  item,
  locale,
  isRtl,
  t,
  onDelete,
  isDeleting,
  categoryId
}: SortablePortfolioRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "hover:bg-neutral-50 transition-colors group bg-white",
        isDragging && "shadow-xl bg-neutral-100"
      )}
    >
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <div 
            {...attributes} 
            {...listeners}
            className="flex items-center gap-2 text-neutral-400 cursor-grab active:cursor-grabbing hover:text-neutral-600 touch-none active:scale-110 transition-transform"
        >
          <GripVertical className="h-3.5 w-3.5 sm:h-4 w-4" />
          <span className="text-[10px] sm:text-sm font-black select-none opacity-40">{item.sortOrder}</span>
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-xl overflow-hidden border border-neutral-100 bg-neutral-50 select-none shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnailUrl || item.mediaUrl}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        {item.titleEn || item.titleAr ? (
          <div className="flex flex-col select-none max-w-[120px] sm:max-w-xs">
            <span className="text-xs sm:text-sm font-black text-neutral-900 truncate">
              {locale === "ar" ? item.titleAr : item.titleEn}
            </span>
            <span className="text-[10px] sm:text-xs text-neutral-500 font-medium opacity-60 truncate">
              {locale === "ar" ? item.titleEn : item.titleAr}
            </span>
          </div>
        ) : (
          <span className="text-[10px] sm:text-sm text-neutral-300 font-black uppercase italic select-none">No Title</span>
        )}
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-tight bg-neutral-100 text-neutral-600 select-none">
          {item.mediaType === MediaType.VIDEO ? (
            <Video className="h-2.5 w-2.5 sm:h-3.5 w-3.5" />
          ) : (
            <ImageIcon className="h-2.5 w-2.5 sm:h-3.5 w-3.5" />
          )}
          {item.mediaType}
        </span>
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
        {item.isActive ? (
          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-tight bg-emerald-50 text-emerald-700 border border-emerald-100 select-none">
            <Eye className={cn("h-2.5 w-2.5 sm:h-3 w-3", isRtl ? "ml-1" : "mr-1")} />
            {t("badgeVisible")}
          </span>
        ) : (
          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-tight bg-neutral-50 text-neutral-500 border border-neutral-100 select-none">
            <EyeOff className={cn("h-2.5 w-2.5 sm:h-3 w-3", isRtl ? "ml-1" : "mr-1")} />
            {t("badgeHidden")}
          </span>
        )}
      </td>
      <td
        className={cn(
          "px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium",
          isRtl ? "text-left" : "text-right"
        )}
      >
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 text-neutral-400 on-click-allow">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:text-[#FF7F11] hover:bg-[#FF7F11]/5 rounded-xl pointer-events-auto transition-colors"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <NextLink href={`/admin/portfolio/${categoryId}/items/${item.id}/edit`}>
              <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Edit</span>
            </NextLink>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
            }}
            disabled={isDeleting}
            className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:text-rose-600 hover:bg-rose-50 rounded-xl pointer-events-auto transition-colors"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {isDeleting ? (
              <div className="h-4 w-4 border-2 border-rose-600 border-t-transparent animate-spin rounded-full" />
            ) : (
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}
