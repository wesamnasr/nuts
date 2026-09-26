import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import {
  Layers,
  Plus,
} from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";
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
import { SortablePortfolioCategoryRow } from "./SortablePortfolioCategoryRow";
import { reorderPortfolioCategories } from "@/actions/portfolio";
import { toast } from "sonner";

export interface PortfolioCategory {
  id: string;
  titleEn: string;
  titleAr: string;
  accentColor: string | null;
  fontFamily: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { items: number };
}

interface PortfolioCategoriesClientProps {
  categories: PortfolioCategory[];
}

export function PortfolioCategoriesClient({ categories: initialCategories }: PortfolioCategoriesClientProps) {
  const { t, dir } = useLocale();
  const isRtl = dir === "rtl";
  const [items, setItems] = useState(initialCategories);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setItems(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
        
      // Optimistic update
      setItems(newItems);

      // Update sort orders based on new index
      const updates = newItems.map((item, index) => ({
          id: item.id,
          sortOrder: index
      }));

      // Call server action
      reorderPortfolioCategories(updates).then(result => {
          if (!result.success) {
              toast.error("Failed to update order");
              // Revert on failure (optional, but good practice)
              setItems(items);
          }
      });
    }
  }

  // Hydration fix: only render DND components after mounting
  if (!isMounted) {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-playfair">{t("adminPortfolio")}</h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">{t("categoriesSubtitle")}</p>
          </div>
          <Button asChild className="w-full sm:w-auto bg-[#d8a868] hover:bg-[#c6975a] rounded-xl h-11 sm:h-12 px-6 text-white font-medium shadow-md transition-all hover:shadow-lg">
            <NextLink href="/admin/portfolio/new" className="flex items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              {t("addNewCategory")}
            </NextLink>
          </Button>
        </div>
        <div className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm overflow-hidden h-64 flex items-center justify-center">
            <div className="animate-pulse text-neutral-300">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 font-playfair">{t("adminPortfolio")}</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">{t("categoriesSubtitle")}</p>
        </div>
        <Button asChild className="w-full sm:w-auto bg-[#d8a868] hover:bg-[#c6975a] rounded-xl h-11 sm:h-12 px-6 text-white font-medium shadow-md transition-all hover:shadow-lg">
          <NextLink href="/admin/portfolio/new" className="flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" />
            {t("addNewCategory")}
          </NextLink>
        </Button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm overflow-hidden">
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
                <table className="w-full min-w-[800px] divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                    <tr>
                    <th className={cn(
                        "px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider w-20",
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
                    <th className={cn(
                        "px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider",
                        isRtl ? "text-right" : "text-left"
                    )}>Accent</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider">{t("columnStatus")}</th>
                    <th className={cn(
                        "px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider",
                        isRtl ? "text-left" : "text-right"
                    )}>{t("columnActions")}</th>
                    </tr>
                </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
                <SortableContext 
                    items={items.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map((category) => (
                        <SortablePortfolioCategoryRow key={category.id} category={category} />
                    ))}
                </SortableContext>
                
                {items.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p>{t("noCategoriesFound")}</p>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        </DndContext>
      </div>
    </div>
  );
}
