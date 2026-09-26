"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortfolioItem, updatePortfolioItem } from "@/actions/portfolio";
import { useLocale } from "@/i18n/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PortfolioMediaUpload } from "@/components/admin/PortfolioMediaUpload";
import { MediaType } from "@prisma/client";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  MessageCircle,
  Info
} from "lucide-react";

interface PortfolioItemFormProps {
  categoryId: string;
  initialData?: {
    id: string;
    mediaUrl: string;
    mediaType: MediaType;
    thumbnailUrl: string | null;
    titleAr: string | null;
    titleEn: string | null;
    descriptionAr: string | null;
    descriptionEn: string | null;
    whatsappMessage: string | null;
    sortOrder: number;
    isActive: boolean;
  };
}

export function PortfolioItemForm({ categoryId, initialData }: PortfolioItemFormProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const isEditing = !!initialData;

  const [mediaUrl, setMediaUrl] = useState(initialData?.mediaUrl || "");
  const [mediaType, setMediaType] = useState<MediaType>(initialData?.mediaType || MediaType.IMAGE);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl || "");
  
  const [titleAr, setTitleAr] = useState(initialData?.titleAr || "");
  const [titleEn, setTitleEn] = useState(initialData?.titleEn || "");
  const [descAr, setDescAr] = useState(initialData?.descriptionAr || "");
  const [descEn, setDescEn] = useState(initialData?.descriptionEn || "");
  const [whatsappMessage, setWhatsappMessage] = useState(initialData?.whatsappMessage || "");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMediaChange = (url: string, type: MediaType, publicId?: string, thumb?: string) => {
    setMediaUrl(url);
    setMediaType(type);
    if (thumb) setThumbnailUrl(thumb);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!mediaUrl) {
         setError(isAr ? "الوسائط مطلوبة" : "Media is required");
         setIsSubmitting(false);
         return;
      }

      const data = {
        mediaUrl,
        mediaType,
        thumbnailUrl: thumbnailUrl || undefined,
        titleAr: titleAr || undefined,
        titleEn: titleEn || undefined,
        descriptionAr: descAr || undefined,
        descriptionEn: descEn || undefined,
        whatsappMessage: whatsappMessage || undefined,
        sortOrder,
        isActive
      };

      const result = isEditing
        ? await updatePortfolioItem(initialData.id, data)
        : await createPortfolioItem({ ...data, categoryId });

      if (!result.success) {
        setError(result.error || (isAr ? "فشل في حفظ العنصر" : "Failed to save item"));
        setIsSubmitting(false);
        return;
      }

      router.push(`/admin/portfolio/${categoryId}/items`);
      router.refresh();
    } catch {
      setError(isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-24 lg:pb-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Media */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
           <div className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm p-4 sm:p-6">
                <Label className="mb-4 block text-base sm:text-lg font-bold">Media</Label>
                <div className="aspect-square sm:aspect-auto">
                    <PortfolioMediaUpload 
                        initialUrl={mediaUrl} 
                        initialType={mediaType} 
                        onChange={handleMediaChange} 
                    />
                </div>
                 <p className="text-[10px] sm:text-xs text-neutral-400 mt-4 text-center">
                    Supported: JPG, PNG, WEBP, MP4
                 </p>
           </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
           {/* Basic Info */}
           <div className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">Details (Optional)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="titleEn" className="text-xs sm:text-sm">Title (EN)</Label>
                    <Input id="titleEn" value={titleEn} onChange={e => setTitleEn(e.target.value)} className="rounded-xl h-11 sm:h-12 text-sm sm:text-base" />
                 </div>
                 <div className="space-y-2" dir="rtl">
                    <Label htmlFor="titleAr" className="text-xs sm:text-sm">العنوان (عربي)</Label>
                    <Input id="titleAr" value={titleAr} onChange={e => setTitleAr(e.target.value)} className="rounded-xl h-11 sm:h-12 text-sm sm:text-base" dir="rtl" />
                 </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="descEn" className="text-xs sm:text-sm">Description (EN)</Label>
                    <Textarea id="descEn" value={descEn} onChange={e => setDescEn(e.target.value)} className="rounded-xl resize-none min-h-[80px] text-sm sm:text-base" />
                 </div>
                 <div className="space-y-2 md:col-span-2" dir="rtl">
                    <Label htmlFor="descAr" className="text-xs sm:text-sm">الوصف (عربي)</Label>
                    <Textarea id="descAr" value={descAr} onChange={e => setDescAr(e.target.value)} className="rounded-xl resize-none min-h-[80px] text-sm sm:text-base" dir="rtl" />
                 </div>
              </div>
           </div>

            {/* Actions & WhatsApp */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm p-4 sm:p-6 md:p-8">
               <div className="flex items-center gap-3 mb-4 sm:mb-6">
                 <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                 <h2 className="text-base sm:text-lg font-bold text-neutral-900">WhatsApp Integration</h2>
              </div>
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsappMessage" className="text-xs sm:text-sm">Custom Inquiry Message</Label>
                    <Textarea 
                        id="whatsappMessage" 
                        value={whatsappMessage} 
                        onChange={e => setWhatsappMessage(e.target.value)} 
                        className="rounded-xl min-h-[80px] text-sm sm:text-base" 
                        placeholder="Hi, I'm interested in this specific item..."
                    />
                    <p className="text-[10px] sm:text-xs text-neutral-400">Leave empty to use default message.</p>
                 </div>
               </div>
            </div>

             {/* Visibility & Order */}
             <div className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-2 w-full sm:w-auto">
                        <Label htmlFor="sortOrder" className="text-xs sm:text-sm">{t("displayOrder")}</Label>
                        <Input 
                            id="sortOrder" 
                            type="number" 
                            value={sortOrder} 
                            onChange={e => setSortOrder(Number(e.target.value))} 
                            className="w-full sm:w-32 rounded-xl h-11 sm:h-12 text-sm sm:text-base"
                        />
                    </div>
                     <div className="flex items-center gap-3 p-3 sm:p-4 bg-neutral-50 rounded-xl w-full sm:w-auto">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="sr-only peer"
                            />
                            <div className="w-10 sm:w-11 h-5 sm:h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                        <span className="text-xs sm:text-sm font-medium text-neutral-900">{isActive ? "Active" : "Inactive"}</span>
                    </div>
                </div>
             </div>
        </div>
      </div>

      {/* DESKTOP ACTION BUTTONS */}
      <div className="hidden lg:flex items-center justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/admin/portfolio/${categoryId}/items`)}
          className="h-12 px-6 rounded-xl"
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white min-w-[200px] flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {t("savingBtn")}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              {isEditing ? (isAr ? "حفظ التعديلات" : "Update Item") : (isAr ? "إضافة للعرض" : "Add Item")}
            </>
          )}
        </Button>
      </div>

      {/* MOBILE ACTION BUTTONS (FIXED) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 flex gap-3 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/admin/portfolio/${categoryId}/items`)}
          className="flex-1 h-12 rounded-xl border-neutral-200 text-neutral-500 font-bold"
        >
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          {isEditing ? (isAr ? "حفظ" : "Update") : (isAr ? "إضافة" : "Add")}
        </Button>
      </div>
    </form>
  );
}
