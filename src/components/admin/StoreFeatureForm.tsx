"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createStoreFeature, updateStoreFeature } from "@/actions/store-feature";
import { useLocale } from "@/i18n/LocaleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Loader2, 
  Upload, 
  X
} from "lucide-react";
import Image from "next/image";

interface StoreFeatureFormProps {
  initialData?: {
    id: string;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    icon: string;
    sortOrder: number;
    isActive: boolean;
  };
}

export function StoreFeatureForm({ initialData }: StoreFeatureFormProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!initialData;

  // Form state
  const [titleAr, setTitleAr] = useState(initialData?.titleAr || "");
  const [titleEn, setTitleEn] = useState(initialData?.titleEn || "");
  const [descAr, setDescAr] = useState(initialData?.descAr || "");
  const [descEn, setDescEn] = useState(initialData?.descEn || "");
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // Icon state
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(initialData?.icon || null);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIcon = () => {
    setIconFile(null);
    setIconPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("titleAr", titleAr);
      formData.append("titleEn", titleEn);
      formData.append("descAr", descAr);
      formData.append("descEn", descEn);
      formData.append("sortOrder", sortOrder.toString());
      formData.append("isActive", String(isActive));

      if (iconFile) {
        formData.append("icon", iconFile);
      }
      
      // Validation for icon
      if (!iconPreview && !iconFile) {
          setError("Icon is required");
          setIsSubmitting(false);
          return;
      }

      const result = isEditing
        ? await updateStoreFeature(initialData.id, formData)
        : await createStoreFeature(formData);

      if (!result.success) {
        setError(result.error || (isAr ? `فشل في ${isEditing ? 'تحديث' : 'إنشاء'} الميزة` : `Failed to ${isEditing ? 'update' : 'create'} store feature`));
        setIsSubmitting(false);
        return;
      }

      toast.success(
        isEditing ? (isAr ? "تم تحديث الميزة بنجاح" : "Store feature updated successfully") : (isAr ? "تم إنشاء الميزة بنجاح" : "Store feature created successfully")
      );

      router.push("/admin/features");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-0 space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-24 lg:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl shadow-sm border-neutral-200/60 overflow-hidden">
            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold">{t("featureDetails")}</CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">{t("featureDetailsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF7F11] opacity-70">
                  {isAr ? "العنوان (بالإنجليزي)" : "Title (English)"}
                </Label>
                <Input 
                  value={titleEn} 
                  onChange={(e) => setTitleEn(e.target.value)} 
                  placeholder="e.g. Free Shipping" 
                  className="h-12 sm:h-14 rounded-xl sm:rounded-2xl text-sm sm:text-base border-neutral-200 focus:ring-primary font-bold tracking-tight"
                  required
                />
              </div>
              <div className="space-y-2 sm:space-y-3 text-right">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF7F11] opacity-70 font-cairo">
                  {isAr ? "العنوان (بالعربي)" : "Title (Arabic)"}
                </Label>
                <Input 
                  value={titleAr} 
                  onChange={(e) => setTitleAr(e.target.value)} 
                  placeholder="مثال: توصيل مجاني"
                  className="h-12 sm:h-14 rounded-xl sm:rounded-2xl text-sm sm:text-base font-black font-cairo text-right border-neutral-200 focus:ring-primary tracking-tight"
                  dir="rtl"
                  required
                />
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF7F11] opacity-70">
                  {isAr ? "الوصف (بالإنجليزي)" : "Description (English)"}
                </Label>
                <Textarea 
                  value={descEn} 
                  onChange={(e) => setDescEn(e.target.value)} 
                  placeholder="Service feature description..."
                  className="rounded-xl sm:rounded-2xl text-sm sm:text-base border-neutral-200 focus:ring-primary min-h-[120px] font-medium leading-relaxed"
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2 sm:space-y-3 text-right">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF7F11] opacity-70 font-cairo">
                  {isAr ? "الوصف (بالعربي)" : "Description (Arabic)"}
                </Label>
                <Textarea 
                  value={descAr} 
                  onChange={(e) => setDescAr(e.target.value)} 
                  placeholder="وصف مميزات الخدمة..."
                  className="rounded-xl sm:rounded-2xl text-sm sm:text-base font-black font-cairo text-right border-neutral-200 focus:ring-primary min-h-[120px] leading-relaxed"
                  dir="rtl"
                  required
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-neutral-200/60 overflow-hidden">
            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold">{t("featureIcon")}</CardTitle>
              <CardDescription className="text-[10px] sm:text-sm">{isAr ? "ارفع أيقونة (يفضل SVG)" : "Upload an icon (SVG preferred) or image"}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div 
                className={`
                  relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors cursor-pointer min-h-[150px]
                  ${iconPreview ? 'border-neutral-200 bg-neutral-50' : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'}
                `}
                onClick={() => !iconPreview && fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleIconChange} 
                  className="hidden" 
                  accept="image/*"
                />

                {iconPreview ? (
                  <div className="relative w-24 h-24 mx-auto group bg-white rounded-lg p-2 border border-neutral-100 flex items-center justify-center">
                    <Image 
                      src={iconPreview} 
                      alt="Icon Preview" 
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeIcon();
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto">
                      <Upload className="h-6 w-6 text-neutral-400" />
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-neutral-900">{isAr ? "انقر للرفع" : "Click to upload icon"}</span>
                      <p className="text-xs text-neutral-500 mt-1">SVG, PNG, JPG</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="rounded-2xl shadow-sm border-neutral-200/60 overflow-hidden">
            <CardHeader className="bg-neutral-50/50 border-b border-neutral-100 p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold">{isAr ? "الإعدادات" : "Settings"}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="active-mode" className="flex flex-col gap-1">
                  <span>{isAr ? "نشط" : "Active Status"}</span>
                  <span className="font-normal text-xs text-neutral-500">
                    {isAr ? "يظهر في الموقع" : "Visible on website"}
                  </span>
                </Label>
                <Switch 
                  id="active-mode" 
                  checked={isActive} 
                  onCheckedChange={setIsActive} 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-neutral-500">{t("displayOrder")}</Label>
                <Input 
                  type="number" 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(Number(e.target.value))} 
                  className="rounded-xl h-11 border-neutral-200 focus:ring-primary"
                />
                <p className="text-xs text-neutral-500">{t("lowerNumbersFirst")}</p>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
              <X className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {/* DESKTOP ACTIONS */}
          <div className="hidden lg:flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="rounded-2xl px-8 h-14 font-black uppercase tracking-tight"
            >
              {t("cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="min-w-[200px] h-14 bg-[#FF7F11] hover:bg-[#e56e00] text-white rounded-2xl font-black uppercase tracking-tight shadow-xl shadow-[#FF7F11]/20 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {isEditing ? t("updatingBtn") : t("creatingBtn")}
                </>
              ) : (
                isEditing ? t("updateFeatureBtn") : t("createFeatureBtn")
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* MOBILE ACTIONS (FIXED) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] flex gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1 h-14 rounded-2xl font-black uppercase tracking-tight"
        >
          {t("cancel")}
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="flex-[2] h-14 bg-[#FF7F11] hover:bg-[#e56e00] text-white rounded-2xl font-black uppercase tracking-tight shadow-xl shadow-[#FF7F11]/20"
        >
          {isSubmitting ? (
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-white" />
          ) : (
            isEditing ? t("updateFeatureBtn") : t("createFeatureBtn")
          )}
        </Button>
      </div>
    </form>
  );
}
