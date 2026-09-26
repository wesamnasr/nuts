"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/use-image-upload";
import { createCustomerPhoto, deleteCustomerPhoto } from "@/actions/customer-photo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Loader2, 
  Upload, 
  Trash2,
  Plus
} from "lucide-react";
import Image from "next/image";
import { useLocale } from "@/i18n/LocaleContext";
import { cn } from "@/lib/utils";

interface CustomerPhoto {
    id: string;
    image: string;
    altText: string | null;
    sortOrder: number;
    isActive: boolean;
}

interface CustomerPhotosManagerProps {
  photos: CustomerPhoto[];
}

export function CustomerPhotosManager({ photos }: CustomerPhotosManagerProps) {
  const { t, locale, dir } = useLocale();
  const isRtl = dir === "rtl";
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [localPhotos, setLocalPhotos] = useState<CustomerPhoto[]>(photos);

  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  const { isDragging, dragHandlers, handlePaste, processFiles } = useImageUpload({
    onFilesSelected: async (selectedFiles) => {
      // Process files one by one (or the first one as currently implemented in actions)
      // The current handleFileUpload handles one file at a time.
      for (const file of selectedFiles) {
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append("image", file);
          formData.append("altText", "Customer Photo");
          formData.append("isActive", "true");

          const result = await createCustomerPhoto(formData);
          
          if (!result.success) {
            toast.error(result.error || (locale === "ar" ? "فشل في رفع الصورة" : "Failed to upload photo"));
          } else {
            toast.success(locale === "ar" ? "تم رفع الصورة بنجاح" : "Photo uploaded successfully");
            if (result.data) {
              setLocalPhotos(prev => [...prev, result.data as CustomerPhoto]);
            }
          }
        } catch (error) {
            console.error(error);
            toast.error(locale === "ar" ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
        } finally {
          setIsUploading(false);
          router.refresh();
        }
      }
    },
    multiple: true
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteFeatureConfirm"))) return;
    
    setDeletingId(id);
    try {
      const result = await deleteCustomerPhoto(id);
      if (!result.success) {
        toast.error(result.error || (locale === "ar" ? "فشل في حذف الصورة" : "Failed to delete photo"));
      } else {
        toast.success(locale === "ar" ? "تم حذف الصورة بنجاح" : "Photo deleted successfully");
        setLocalPhotos(prev => prev.filter(p => p.id !== id));
        router.refresh();
      }
    } catch (error) {
        console.error(error);
        toast.error(locale === "ar" ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div 
      className={cn(
        "space-y-4 sm:space-y-6 outline-none transition-all duration-300 rounded-[2rem]",
        isDragging && "ring-8 ring-primary/20 bg-primary/5 p-4 -m-4"
      )} 
      dir={dir}
      {...dragHandlers}
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-neutral-200/60 shadow-sm gap-6 sm:gap-8">
        <div className={cn("w-full space-y-1.5", isRtl ? "text-right" : "text-left")}>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 uppercase tracking-tight font-playfair">{t("customerPhotosTitle")}</h2>
            <p className="text-neutral-500 text-[10px] sm:text-xs font-medium opacity-80 leading-tight">{t("customerPhotosSubtitle")}</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
            />
            <Button 
                onClick={() => fileInputRef.current?.click()} 
                disabled={isUploading}
                className="w-full sm:min-w-[180px] bg-[#FF7F11] hover:bg-[#e56e00] text-white rounded-2xl h-14 sm:h-12 text-sm font-black uppercase tracking-tight shadow-xl shadow-[#FF7F11]/20 transition-all active:scale-[0.98] gap-2"
            >
                {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Plus className="h-5 w-5" />
                )}
                {t("addFeature")}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {localPhotos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-all">
            <Image
              src={photo.image}
              alt={photo.altText || "Customer photo"}
              fill
              className="object-cover"
            />
            
            <div className="absolute inset-0 bg-black/40 sm:opacity-0 sm:group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <Button 
                    size="icon" 
                    variant="destructive" 
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl shadow-xl transition-all hover:scale-110 active:scale-90"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                >
                    {deletingId === photo.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                </Button>
            </div>
            
            {!photo.isActive && (
                <div className={cn("absolute top-2 bg-yellow-100/90 backdrop-blur-sm text-yellow-800 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full", isRtl ? "left-2" : "right-2")}>
                    {t("inactive")}
                </div>
            )}
          </div>
        ))}
        
        {/* Upload Placeholder */}
        <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className="aspect-square bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 cursor-pointer transition-all p-4"
        >
            {isUploading ? (
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
            ) : (
                <>
                    <Upload className="h-6 w-6 sm:h-8 sm:w-8 mb-2" />
                    <span className="text-[10px] sm:text-sm font-medium text-center">{locale === "ar" ? "رفع صورة جديدة" : "Upload New"}</span>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
