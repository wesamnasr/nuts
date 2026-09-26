"use client";

import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import {
  Plus,
  ArrowLeft
} from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";
import { MediaType } from "@prisma/client";
import { deletePortfolioItem } from "@/actions/portfolio";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortablePortfolioRow } from "./SortablePortfolioRow";

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

interface PortfolioItemsClientProps {
  categoryId: string;
  categoryTitle: string;
  items: PortfolioItem[];
}

export function PortfolioItemsClient({ categoryId, categoryTitle, items: initialItems }: PortfolioItemsClientProps) {
  const { t, locale, dir } = useLocale();
  const isRtl = dir === "rtl";
  const isAr = locale === "ar";
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Optimistic update of sortOrder for UI consistency
        const updatedItems = newItems.map((item, index) => ({
            ...item,
            sortOrder: index
        }));

        // Call server action outside of render cycle
        // Using setTimeout to break the render cycle or just calling it here if we weren't in setState
        // But since we need 'items' to calculate indices, we are in setState
        // Better approach: calculate outside
        return updatedItems;
      });

      // Get the latest items state after update or calculate it again?
      // Since setState is async, we can't rely on 'items' being updated immediately
      // But we can calculate the new order based on current 'items' in the closure
      // if we assume 'items' is fresh. 
    }
  };

  const handleDelete = async (id: string) => {
      if(!confirm(t("confirmDelete"))) return;
      setIsDeleting(id);
      try {
          const result = await deletePortfolioItem(id);
          if(result.success) {
              toast.success(t("itemDeleted"));
              router.refresh();
          } else {
              toast.error(result.error);
          }
      } catch {
          toast.error(t("unexpectedError"));
      } finally {
          setIsDeleting(null);
      }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 sm:pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-2 text-neutral-500 text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-60">
               <NextLink href="/admin/portfolio" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3 sm:h-4 w-4" />
                  {t("adminPortfolio")}
               </NextLink>
               <span>/</span>
               <span className="truncate max-w-[150px]">{categoryTitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-900 font-playfair tracking-tight uppercase">
              {categoryTitle}
            </h1>
            <p className="text-neutral-500 text-xs sm:text-sm font-medium opacity-80">
              {isAr ? "إدارة العناصر في هذا القسم وتنظيمها." : "Manage and organize items within this section."}
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto bg-[#FF7F11] hover:bg-[#e56e00] text-white rounded-xl sm:rounded-2xl h-12 sm:h-14 px-6 sm:px-8 font-black uppercase tracking-tight shadow-xl shadow-[#FF7F11]/30 transition-all active:scale-[0.98]">
            <NextLink href={`/admin/portfolio/${categoryId}/items/new`} className="flex items-center justify-center gap-2">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
              {isAr ? "إضافة عنصر جديد" : "Add New Item"}
            </NextLink>
          </Button>
        </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className={cn(
                "px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider w-20",
                isRtl ? "text-right" : "text-left"
              )}>{t("columnOrder")}</th>
              <th className={cn(
                "px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider",
                isRtl ? "text-right" : "text-left"
              )}>{t("catThumbnail")}</th>
              <th className={cn(
                "px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider",
                isRtl ? "text-right" : "text-left"
              )}>Title</th>
              <th className={cn(
                "px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider",
                isRtl ? "text-right" : "text-left"
              )}>Type</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-neutral-500 uppercase tracking-wider">{t("columnStatus")}</th>
              <th className={cn(
                "px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider",
                isRtl ? "text-left" : "text-right"
              )}>{t("columnActions")}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
              <SortableContext
                items={items}
                strategy={verticalListSortingStrategy}
              >
                {items.map((item) => (
                  <SortablePortfolioRow
                    key={item.id}
                    item={item}
                    locale={locale}
                    isRtl={isRtl}
                    t={t as any}
                    onDelete={handleDelete}
                    isDeleting={isDeleting === item.id}
                    categoryId={categoryId}
                  />
                ))}
              </SortableContext>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-10" />
                  <p>{isAr ? "لا توجد عناصر في هذا القسم." : "No items found in this section."}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
   </DndContext>
  );
}
