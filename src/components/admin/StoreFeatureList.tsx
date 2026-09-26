"use client";

import { useState } from "react";
import { StoreFeature } from "@prisma/client";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent 
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Trash2, EyeOff } from "lucide-react";
import NextLink from "next/link";
import Image from "next/image";
import { deleteStoreFeature, reorderStoreFeatures } from "@/actions/store-feature";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";

interface StoreFeatureListProps {
  initialFeatures: StoreFeature[];
}

function SortableItem({ feature, onDelete }: { feature: StoreFeature; onDelete: (id: string) => void }) {
  const { t, dir } = useLocale();
  const isRtl = dir === "rtl";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: feature.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white border rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 group hover:shadow-sm transition-all"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-neutral-300 hover:text-primary shrink-0 transition-colors">
        <GripVertical className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-50 rounded-xl sm:rounded-2xl border border-neutral-100 p-2 sm:p-3 flex items-center justify-center shrink-0 shadow-inner">
         {feature.icon && (
            <Image 
                src={feature.icon} 
                alt={feature.titleEn} 
                width={32} 
                height={32} 
                className="object-contain sm:scale-125"
            />
         )}
      </div>

      <div className="grow min-w-0">
        <div className={cn("flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-0.5", isRtl ? "flex-row-reverse" : "flex-row")}>
          <h3 className="font-bold text-neutral-900 text-sm sm:text-base truncate">{isRtl ? feature.titleAr : feature.titleEn}</h3>
          <span className={cn("text-[10px] sm:text-xs text-neutral-400 font-medium", isRtl ? "border-r sm:pr-2" : "border-l sm:pl-2")}>
            {isRtl ? feature.titleEn : feature.titleAr}
          </span>
          {!feature.isActive && (
            <span className="bg-neutral-100 text-neutral-500 text-[9px] sm:text-[10px] uppercase font-black px-1.5 py-0.5 rounded leading-none">
              {t("inactive")}
            </span>
          )}
        </div>
        <p className={cn("text-[10px] sm:text-sm text-neutral-500 truncate max-w-[180px] sm:max-w-md", isRtl ? "text-right" : "text-left")}>
            {isRtl ? feature.descAr : feature.descEn}
        </p>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
        <NextLink href={`/admin/features/${feature.id}/edit`} className="on-click-allow">
          <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-11 sm:w-11 text-neutral-400 hover:text-[#FF7F11] hover:bg-[#FF7F11]/5 rounded-xl transition-colors">
            <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </NextLink>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 sm:h-11 sm:w-11 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors on-click-allow"
          onClick={() => onDelete(feature.id)}
        >
          <Trash2 className="w-4 h-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  );
}

export function StoreFeatureList({ initialFeatures }: StoreFeatureListProps) {
  const [features, setFeatures] = useState(initialFeatures);
  const router = useRouter();
  const { t, dir } = useLocale();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = features.findIndex((item) => item.id === active.id);
      const newIndex = features.findIndex((item) => item.id === over?.id);
      
      const newItems = arrayMove(features, oldIndex, newIndex);
      setFeatures(newItems);
      
      try {
        const updates = newItems.map((item, index) => ({
          id: item.id,
          sortOrder: index
        }));
        
        const result = await reorderStoreFeatures(updates);
        if (result.success) {
          toast.success(t("orderUpdated"));
        } else {
          toast.error(t("failedToUpdateOrder"));
          // Revert on failure
          setFeatures(features);
        }
      } catch (error) {
        console.error("DRAG_END_ERROR:", error);
        toast.error(t("failedToUpdateOrder"));
        setFeatures(features);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("deleteFeatureConfirm"))) {
        const result = await deleteStoreFeature(id);
        if (result.success) {
            toast.success(t("featureDeleted"));
            setFeatures(features.filter(f => f.id !== id));
            router.refresh();
        } else {
            toast.error(t("failedToDeleteFeature"));
        }
    }
  };

  if (features.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-neutral-300">
        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <EyeOff className="w-6 h-6 text-neutral-400" />
        </div>
        <h3 className="text-lg font-medium text-neutral-900">{t("noFeaturesYet")}</h3>
        <p className="text-neutral-500 mt-1 max-w-sm mx-auto">
            {t("addFeaturesDesc")}
        </p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={features.map(f => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3" dir={dir}>
          {features.map((feature) => (
            <SortableItem key={feature.id} feature={feature} onDelete={handleDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
