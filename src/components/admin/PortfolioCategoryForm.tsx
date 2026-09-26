"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortfolioCategory, updatePortfolioCategory } from "@/actions/portfolio";
import { useLocale } from "@/i18n/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";  
import { PortfolioMediaUpload } from "@/components/admin/PortfolioMediaUpload"; 
import {
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Palette
} from "lucide-react";

interface PortfolioCategoryFormProps {
  initialData?: {
    id: string;
    titleEn: string;
    titleAr: string;
    descriptionEn?: string | null;
    descriptionAr?: string | null;
    logo?: string | null;
    coverImage?: string | null;
    accentColor: string | null;
    fontFamily: string | null;
    sortOrder: number;
    isActive: boolean;
  };
}

export function PortfolioCategoryForm({ initialData }: PortfolioCategoryFormProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const isEditing = !!initialData;

  const [titleEn, setTitleEn] = useState(initialData?.titleEn || "");
  const [titleAr, setTitleAr] = useState(initialData?.titleAr || "");
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn || "");
  const [descriptionAr, setDescriptionAr] = useState(initialData?.descriptionAr || "");
  const [logo, setLogo] = useState(initialData?.logo || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [accentColor, setAccentColor] = useState(initialData?.accentColor || "#d8a868");
  const [fontFamily, setFontFamily] = useState(initialData?.fontFamily || "");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!titleEn.trim() || !titleAr.trim()) {
        setError(isAr ? "الاسم بالعربي والإنجليزي مطلوبان" : "Both English and Arabic names are required.");
        setIsSubmitting(false);
        return;
      }

      const data = {
        titleEn,
        titleAr,
        descriptionEn: descriptionEn || undefined,
        descriptionAr: descriptionAr || undefined,
        logo: logo || undefined,
        coverImage: coverImage || undefined,
        accentColor,
        fontFamily: fontFamily.trim() || undefined,
        sortOrder,
        isActive
      };

      const result = isEditing
        ? await updatePortfolioCategory(initialData.id, data)
        : await createPortfolioCategory(data);

      if (!result.success) {
        setError(result.error || (isAr ? "فشل في حفظ الفئة" : "Failed to save category"));
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/portfolio");
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
          <button type="button" onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
            <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900">{t("basicInfo")}</h2>
            <p className="text-xs sm:text-sm text-neutral-500">{t("basicInfoDesc")}</p>
          </div>
        </div>

        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                    <Label htmlFor="titleEn" className="text-xs sm:text-sm">Category Name (English)</Label>
                    <Input id="titleEn" value={titleEn} onChange={e => setTitleEn(e.target.value)} className="rounded-xl h-11 sm:h-12 text-sm sm:text-base" />
                </div>
                <div className="space-y-2" dir="rtl">
                    <Label htmlFor="titleAr" className="text-xs sm:text-sm">اسم الفئة (عربي)</Label>
                    <Input id="titleAr" value={titleAr} onChange={e => setTitleAr(e.target.value)} className="rounded-xl h-11 sm:h-12 text-sm sm:text-base" dir="rtl" />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="descriptionEn" className="text-xs sm:text-sm">Description (English)</Label>
                    <Textarea
                      id="descriptionEn"
                      value={descriptionEn}
                      onChange={e => setDescriptionEn(e.target.value)}
                      className="rounded-xl resize-none min-h-[80px] text-sm sm:text-base"
                      placeholder="Optional short description..."
                    />
                </div>
                <div className="space-y-2 md:col-span-2" dir="rtl">
                    <Label htmlFor="descriptionAr" className="text-xs sm:text-sm">الوصف (عربي)</Label>
                    <Textarea
                      id="descriptionAr"
                      value={descriptionAr}
                      onChange={e => setDescriptionAr(e.target.value)}
                      className="rounded-xl resize-none min-h-[80px] text-sm sm:text-base"
                      dir="rtl"
                      placeholder="وصف قصير اختياري..."
                    />
                </div>
            </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-blue-50 flex items-center justify-center">
                    <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-neutral-900">Media Assets</h2>
                    <p className="text-xs sm:text-sm text-neutral-500">Logo and cover image for this category</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Label>Category Logo (Optional)</Label>
                    <PortfolioMediaUpload
                        initialUrl={logo}
                        onChange={(url) => setLogo(url)}
                        onRemove={() => setLogo("")}
                        folder="portfolio/categories/logos"
                        label="Upload Logo"
                    />
                    <p className="text-xs text-neutral-400">Recommended: Square PNG with transparent background.</p>
                </div>
                <div className="space-y-4">
                    <Label>Cover Image (Optional)</Label>
                    <PortfolioMediaUpload
                         initialUrl={coverImage}
                         onChange={(url) => setCoverImage(url)}
                         onRemove={() => setCoverImage("")}
                         folder="portfolio/categories/covers"
                         label="Upload Cover Image"
                    />
                     <p className="text-xs text-neutral-400">Recommended: High quality landscape image.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Styling & Order */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border shadow-sm p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-purple-50 flex items-center justify-center">
            <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900">Styling & Order</h2>
            <p className="text-xs sm:text-sm text-neutral-500">Custom colors and display order</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="accentColor" className="text-xs sm:text-sm">Accent Color</Label>
            <div className="flex gap-2">
                <Input
                id="accentColor"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-11 sm:h-12 w-16 sm:w-20 rounded-xl p-1 cursor-pointer"
                />
                <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-11 sm:h-12 rounded-xl font-mono uppercase text-sm sm:text-base"
                />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontFamily" className="text-xs sm:text-sm">Font Family (Optional)</Label>
            <Input
              id="fontFamily"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              placeholder="e.g. 'Playfair Display', serif"
              className="h-11 sm:h-12 rounded-xl text-sm sm:text-base"
            />
          </div>

           <div className="space-y-2">
            <Label htmlFor="sortOrder" className="text-xs sm:text-sm">{t("displayOrder")}</Label>
            <Input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="h-11 sm:h-12 rounded-xl text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 p-4 bg-neutral-50 rounded-xl">
           <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
           <div>
            <p className="text-sm font-medium text-neutral-900">
              {isActive ? t("visibleOnStore") : t("hiddenFromStore")}
            </p>
            <p className="text-xs text-neutral-400">
              {t("toggleVisibility")}
            </p>
          </div>
        </div>
      </div>

      {/* DESKTOP ACTION BUTTONS */}
      <div className="hidden lg:flex items-center justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/portfolio")}
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
              {isEditing ? t("updateCategoryBtnLabel") : t("createCategoryBtn")}
            </>
          )}
        </Button>
      </div>

      {/* MOBILE ACTION BUTTONS (FIXED) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 flex gap-3 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/portfolio")}
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
          {isEditing ? (isAr ? "حفظ" : "Update") : (isAr ? "إضافة" : "Create")}
        </Button>
      </div>
    </form>
  );
}
