"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { Plus } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AboutSection, reorderAboutSections } from "@/actions/about";
import { SortableAboutSectionRow } from "./SortableAboutSectionRow";

interface AboutSectionsClientProps {
  sections: AboutSection[];
}

export function AboutSectionsClient({ sections: initialSections }: AboutSectionsClientProps) {
  const [items, setItems] = useState(initialSections);
  const { t, dir } = useLocale();
  const isRtl = dir === "rtl";

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
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
      reorderAboutSections(updates).then(result => {
          if (!result.success) {
              toast.error("Failed to update order");
              setItems(items); // Revert
          }
      });
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900 font-playfair">
             {t("adminAbout")}
          </h1>
          <p className="text-neutral-500 text-xs sm:text-base">
            {isRtl ? "إدارة أقسام صفحة من نحن وترتيبها." : "Manage your about page sections and their order."}
          </p>
        </div>
        <NextLink href="/admin/about/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto h-12 bg-[#FF7F11] hover:bg-[#e56e00] text-white rounded-xl shadow-lg shadow-[#FF7F11]/20 font-bold gap-2">
            <Plus className="h-5 w-5" />
            {isRtl ? "إضافة قسم" : "Add Section"}
          </Button>
        </NextLink>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className={cn(
                    "px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-wider w-16 sm:w-20",
                     isRtl ? "text-right" : "text-left"
                  )}>{isRtl ? "الترتيب" : "Order"}</th>
                   <th className={cn(
                    "px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-wider",
                     isRtl ? "text-right" : "text-left"
                  )}>{isRtl ? "الصورة" : "Image"}</th>
                  <th className={cn(
                    "px-4 sm:px-6 py-4 text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-wider",
                     isRtl ? "text-right" : "text-left"
                  )}>{isRtl ? "العنوان" : "Title"}</th>
                  <th className={cn(
                    "hidden md:table-cell px-6 py-4 text-[10px] sm:text-xs font-black text-neutral-500 uppercase tracking-wider",
                     isRtl ? "text-right" : "text-left"
                  )}>{isRtl ? "الوصف" : "Description"}</th>
                  <th className="px-4 sm:px-6 py-4 w-16 sm:w-20"></th>
                </tr>
              </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                {items.map((section) => (
                  <SortableAboutSectionRow key={section.id} section={section} />
                ))}
              </SortableContext>
              
                {items.length === 0 && (
                  <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                          {isRtl ? "لا توجد أقسام. انقر على \"إضافة قسم\" لإنشاء واحد." : "No sections found. Click \"Add Section\" to create one."}
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
