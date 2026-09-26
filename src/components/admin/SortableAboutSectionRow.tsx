"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { Edit2, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";
import { AboutSection, deleteAboutSection } from "@/actions/about";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SortableAboutSectionRowProps {
  section: AboutSection;
}

export function SortableAboutSectionRow({ section }: SortableAboutSectionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const { locale, dir } = useLocale();
  const isRtl = dir === "rtl";
  const router = useRouter();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? "relative" as const : undefined,
  };

  const handleDelete = async () => {
      if(confirm("Are you sure you want to delete this section?")) {
          const res = await deleteAboutSection(section.id);
          if(res.success) {
              toast.success("Section deleted");
              router.refresh();
          } else {
              toast.error("Failed to delete");
          }
      }
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "hover:bg-neutral-50 transition-colors group bg-white",
        isDragging && "shadow-lg opacity-80 bg-neutral-50 z-50"
      )}
    >
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <div 
            {...attributes} 
            {...listeners}
            className="flex items-center gap-2 text-neutral-300 hover:text-primary cursor-grab active:cursor-grabbing touch-none active:scale-110 transition-transform"
        >
          <GripVertical className="h-4 w-4" />
          <span className="text-[10px] sm:text-sm font-black text-neutral-900 opacity-40">{section.sortOrder}</span>
        </div>
      </td>
       <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        {section.image && (
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-neutral-100 shadow-sm bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={section.image} alt={section.titleEn} className="w-full h-full object-cover" />
            </div>
        )}
      </td>
      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col max-w-[120px] sm:max-w-xs">
          <span className="text-xs sm:text-sm font-black text-neutral-900 truncate">
            {locale === "ar" ? section.titleAr : section.titleEn}
          </span>
          <span className="text-[10px] sm:text-xs text-neutral-400 font-medium opacity-60 truncate">
            {locale === "ar" ? section.titleEn : section.titleAr}
          </span>
        </div>
      </td>
      <td className="hidden md:table-cell px-6 py-4">
        <p className="text-sm text-neutral-500 truncate max-w-[200px]">
             {locale === "ar" ? section.descriptionAr : section.descriptionEn}
        </p>
      </td>
     
      <td
        className={cn(
          "px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium",
          isRtl ? "text-left" : "text-right"
        )}
      >
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 text-neutral-400 on-click-allow">
          <NextLink href={`/admin/about/${section.id}/edit`} className="on-click-allow pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 sm:h-11 sm:w-11 text-neutral-400 hover:text-[#FF7F11] hover:bg-[#FF7F11]/5 rounded-xl transition-colors"
            >
              <Edit2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Edit</span>
            </Button>
          </NextLink>

           <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-9 w-9 sm:h-11 sm:w-11 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors on-click-allow pointer-events-auto"
          >
            <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}
