"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/use-image-upload";
import { createCategory, updateCategory } from "@/actions/category";
import { useLocale } from "@/i18n/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Unlock,
  Upload,
  X,
  Globe,
  Layers,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface CategoryOption {
  id: string;
  nameEn: string;
  nameAr: string;
  parentId: string | null;
}

interface CategoryFormProps {
  categories: CategoryOption[];
  defaultSortOrder: number;
  initialData?: {
    id: string;
    nameEn: string;
    nameAr: string;
    slug: string;
    parentId: string | null;
    sortOrder: number;
    isActive: boolean;
    image: string | null;
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryForm({
  categories,
  defaultSortOrder,
  initialData,
}: CategoryFormProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!initialData;

  // Form state
  const [nameEn, setNameEn] = useState(initialData?.nameEn || "");
  const [nameAr, setNameAr] = useState(initialData?.nameAr || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugLocked, setSlugLocked] = useState(!initialData); // Lock by default only for new
  const [parentId, setParentId] = useState(initialData?.parentId || "");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? defaultSortOrder);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle nameEn change + auto-slug
  const handleNameEnChange = (value: string) => {
    setNameEn(value);
    if (slugLocked) {
      setSlug(slugify(value));
    }
  };

  const { isDragging, dragHandlers, handlePaste, processFiles } = useImageUpload({
    onFilesSelected: (files) => {
      const file = files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        setError(isAr ? "يجب أن تكون الصورة أقل من ٥ ميجابايت" : "Image must be under 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    },
    multiple: false
  });

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Client-side validation
      if (!nameEn.trim() || !nameAr.trim()) {
        setError(isAr ? "الاسم بالعربي والإنجليزي مطلوبان" : "Both English and Arabic names are required.");
        setIsSubmitting(false);
        return;
      }
      if (!slug.trim()) {
        setError(t("urlSlug") + " " + (isAr ? "مطلوب" : "is required"));
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("nameEn", nameEn.trim());
      formData.append("nameAr", nameAr.trim());
      formData.append("slug", slug.trim());
      formData.append("parentId", parentId || "");
      formData.append("sortOrder", sortOrder.toString());
      formData.append("isActive", isActive.toString());

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const result = isEditing
        ? await updateCategory(initialData.id, formData)
        : await createCategory(formData);

      if (!result.success) {
        setError(result.error || (isAr ? `فشل في ${isEditing ? 'تحديث' : 'إنشاء'} الفئة` : `Failed to ${isEditing ? 'update' : 'create'} category`));
        setIsSubmitting(false);
        return;
      }

      // Success — redirect
      router.push("/admin/categories");
      router.refresh();
    } catch {
      setError(isAr ? "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." : "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Filter parent options (only root categories as parents, excluding self if editing)
  const parentOptions = categories.filter((c) => !c.parentId && c.id !== initialData?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 pb-24 lg:pb-8">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800 wrap-break-word">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Grid Layout for Desktop, Stacked for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* MAIN CONTENT: Left 2 columns */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Section 1: Basic Info */}
          <Card className="rounded-2xl sm:rounded-3xl border shadow-sm border-neutral-100 overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Layers className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A]">
                    {t("basicInfo")}
                  </h2>
                  <p className="text-[11px] sm:text-sm text-neutral-500 font-medium">
                    {t("basicInfoDesc")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* English Name */}
                <div className="space-y-2">
                  <Label htmlFor="nameEn" className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">
                    English Name (EN) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nameEn"
                    value={nameEn}
                    onChange={(e) => handleNameEnChange(e.target.value)}
                    placeholder="e.g. Modern Living Rooms"
                    className="h-11 sm:h-12 rounded-xl border-neutral-200 focus-visible:ring-primary text-sm shadow-sm"
                    required
                  />
                </div>

                {/* Arabic Name */}
                <div className="space-y-2" dir="rtl">
                  <Label htmlFor="nameAr" className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">
                    الاسم (عربي) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nameAr"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: غرف المعيشة الحديثة"
                    className="h-11 sm:h-12 rounded-xl border-neutral-200 focus-visible:ring-primary font-cairo text-sm shadow-sm"
                    dir="rtl"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: SEO & Slug */}
          <Card className="rounded-2xl sm:rounded-3xl border shadow-sm border-neutral-100 overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A]">
                    {t("seoUrl")}
                  </h2>
                  <p className="text-[11px] sm:text-sm text-neutral-500 font-medium">
                    {t("seoUrlDesc")}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Slug Field */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">
                    {t("urlSlug")}
                  </Label>
                  <div className="relative flex items-center">
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      disabled={slugLocked}
                      placeholder="auto-generated-slug"
                      className={`h-11 sm:h-12 rounded-xl border-neutral-200 pr-12 font-mono text-xs sm:text-sm shadow-sm ${
                        slugLocked
                          ? "bg-neutral-50/50 text-neutral-500"
                          : "bg-white focus-visible:ring-primary"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setSlugLocked(!slugLocked)}
                      className="absolute right-3 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                      title={slugLocked ? (isAr ? "افتح للتعديل يدوياً" : "Unlock to edit manually") : (isAr ? "قفل للإنشاء التلقائي" : "Lock to auto-generate")}
                    >
                      {slugLocked ? (
                        <Lock className="h-4 w-4 text-neutral-400" />
                      ) : (
                        <Unlock className="h-4 w-4 text-blue-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* SEO Preview */}
                {slug && (
                  <div className="bg-neutral-50/50 rounded-2xl p-4 sm:p-5 border border-dashed border-neutral-200">
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mb-2">
                      {isAr ? "معاينة SEO" : "SEO Preview"}
                    </p>
                    <p className="text-xs sm:text-sm text-green-700 font-medium break-all flex items-center gap-1">
                      <span className="opacity-60 shrink-0">yourstore.com/category/</span>
                      <span className="font-bold underline decoration-green-200">{slug}</span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Category Image */}
          <Card 
            className={cn(
              "rounded-2xl sm:rounded-3xl border shadow-sm border-neutral-100 overflow-hidden transition-all hover:shadow-md duration-300",
              isDragging && "ring-4 ring-primary ring-offset-4 scale-[0.99] border-primary border-dashed bg-primary/5"
            )}
            {...dragHandlers}
            onPaste={handlePaste}
            tabIndex={0}
          >
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A]">
                    {t("catThumbnail")}
                  </h2>
                  <p className="text-[11px] sm:text-sm text-neutral-500 font-medium">
                    {t("catThumbnailDesc")}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                {imagePreview ? (
                  <div className="relative w-full sm:w-64 shrink-0">
                    <div className="aspect-square sm:aspect-4/3 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50 shadow-inner group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt={isAr ? "معاينة الفئة" : "Category preview"}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={removeImage}
                          className="h-10 w-10 rounded-full shadow-xl"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-64 aspect-square sm:aspect-4/3 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 hover:bg-neutral-100 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 group cursor-pointer overflow-hidden shrink-0"
                  >
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white border border-neutral-200 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all group-hover:scale-110">
                      <Upload className="h-6 w-6 text-neutral-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-xs sm:text-sm font-bold text-neutral-600 group-hover:text-neutral-900">
                        {t("clickToUpload")}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-1 font-medium">
                        PNG, JPG {isAr ? "حتى ٥ ميجا" : "up to 5MB"}
                      </p>
                    </div>
                  </button>
                )}
                
                <div className="flex-1 flex flex-col justify-center py-2">
                   <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                    <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {isAr ? "نصيحة الصور" : "Image Tip"}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-neutral-600 leading-relaxed font-medium">
                      {isAr ? (
                        "استخدم صورة عالية الجودة بخلفية واضحة. يفضل أن تكون الأبعاد مربعة (1:1) لأفضل ظهور في المتجر."
                      ) : (
                        "Use high-quality images with clear backgrounds. Square aspect ratio (1:1) is recommended for best storefront display."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR CONTENT: Right 1 column */}
        <div className="space-y-6 sm:space-y-8 lg:col-span-1">
          {/* Section 3: Category Hierarchy & Status */}
          <Card className="rounded-2xl sm:rounded-3xl border shadow-sm border-neutral-100 overflow-hidden lg:sticky lg:top-24">
            <CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <Layers className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-serif text-[#1A1A1A]">
                    {t("catHierarchy")}
                  </h2>
                </div>
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="parentId" className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">
                  {t("parentCategory")}
                </Label>
                <select
                  id="parentId"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full h-11 sm:h-12 rounded-xl border border-neutral-200 bg-white px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none shadow-sm transition-all"
                >
                  <option value="">{t("noneRoot")}</option>
                  {parentOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {isAr ? cat.nameAr : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label htmlFor="sortOrder" className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">
                  {t("displayOrder")}
                </Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="h-11 sm:h-12 rounded-xl border-neutral-200 focus-visible:ring-primary text-sm shadow-sm"
                />
                <p className="text-[10px] text-neutral-400 italic font-medium px-1">
                  {t("lowerNumbersFirst")}
                </p>
              </div>

              {/* Visibility Toggle */}
                <div className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all",
                  isActive ? "bg-emerald-50/50 border-emerald-100" : "bg-neutral-50 border-neutral-100"
                )}>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs sm:text-sm font-bold truncate",
                      isActive ? "text-emerald-700" : "text-neutral-700"
                    )}>
                      {isActive ? t("visibleOnStore") : t("hiddenFromStore")}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-medium">
                      {t("columnStatus")}
                    </p>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                {/* DESKTOP ACTION BUTTONS */}
                <div className="hidden lg:flex flex-col gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !nameEn || !nameAr}
                    className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {isEditing ? t("updatingBtn") : t("creatingBtn")}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                        {isEditing ? t("updateCategoryBtnLabel") : t("createCategoryBtn")}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/categories")}
                    className="w-full h-12 rounded-xl border-neutral-200 text-neutral-500 font-bold hover:bg-neutral-50"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      {/* MOBILE ACTION BUTTONS (FIXED BOTTOM) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 flex gap-3 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/categories")}
        >
          {isAr ? "إلغاء" : "Cancel"}
        </Button>
      </div>
    </form>
  );
}
