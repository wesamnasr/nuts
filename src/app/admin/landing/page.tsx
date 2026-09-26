"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Save, Loader2, Upload, AlertCircle, Calendar, Settings2, Layout, Images, Gift, Camera, Package } from "lucide-react";
import { getLandingConfig, updateLandingConfig } from "@/actions/landing";
import { getCollections, toggleCollectionStatus } from "@/actions/collections";
import { getCustomerPhotos } from "@/actions/customer-photo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VercelBlobUpload } from "@/components/admin/VercelBlobUpload";
import { uploadHeroImage } from "@/actions/landing";
import Image from "next/image";
import { SortableSectionList } from "@/components/admin/SortableSectionList";
import { ProductPicker } from "@/components/admin/ProductPicker";
import { CollectionManager, type Collection } from "@/components/admin/CollectionManager";
import { CustomerPhotosManager } from "@/components/admin/CustomerPhotosManager";
import { useLocale } from "@/i18n/LocaleContext";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

const landingSchema = z.object({
  heroTitleAr: z.string().min(1, "Required"),
  heroTitleEn: z.string().min(1, "Required"),
  heroSubtitleAr: z.string().min(1, "Required"),
  heroSubtitleEn: z.string().min(1, "Required"),
  heroImage: z.string().url("Must be a valid URL"),
  heroButtonTextAr: z.string().min(1, "Required"),
  heroButtonTextEn: z.string().min(1, "Required"),
  heroLink: z.string().min(1, "Required"),
  
  showHero: z.boolean(),
  showFeatures: z.boolean(),
  showNewArrivals: z.boolean(),
  showBestSellers: z.boolean(),
  showFlashSales: z.boolean(),
  showCategories: z.boolean(),
  showTestimonials: z.boolean(),
  showNewsletter: z.boolean(),

  manualNewArrivalIds: z.array(z.string()),
  manualBestSellerIds: z.array(z.string()),
  manualFlashSaleIds: z.array(z.string()),
  manualFlashSaleId: z.string().optional().nullable(),
  flashSaleDiscount: z.coerce.number().int("Must be a whole number").min(0, "Must be at least 0%").max(100, "Must be under 100%").optional().nullable(),
  flashSaleEndDate: z.string().optional().nullable(),
});

type LandingFormValues = z.infer<typeof landingSchema>;

export default function AdminLandingPage() {
  const { t, locale, dir } = useLocale();
  const isRtl = dir === "rtl";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionsOrder, setSectionsOrder] = useState<string[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [customerPhotos, setCustomerPhotos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadPreset] = useState("New-Concent");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(landingSchema) as any,
  });

  const heroImage = watch("heroImage");
  const visibility = watch();

  const SECTION_LABELS: Record<string, string> = {
    hero: t("sectionHero"),
    categories: t("sectionCategories"),
    new_arrivals: t("sectionNewArrivals"),
    best_sellers: t("sectionBestSellers"),
    flash_sale: t("sectionFlashSale"),
    testimonials: t("sectionTestimonials"),
    customer_photos: t("sectionCustomerPhotos"),
    features: t("sectionFeatures"),
    newsletter: t("sectionNewsletter"),
  };

  const loadCollections = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await getCollections();
      if (res.success && res.data) {
        setCollections(res.data);
      }
    } catch {
      toast.error(locale === "ar" ? "فشل في تحميل المجموعات" : "Failed to load collections");
    } finally {
      setRefreshing(false);
    }
  }, [locale]);

  const loadPhotos = useCallback(async () => {
    try {
      const res = await getCustomerPhotos();
      if (res.success && res.data) {
        setCustomerPhotos(res.data);
      }
    } catch {
      toast.error(locale === "ar" ? "فشل في تحميل الصور" : "Failed to load photos");
    }
  }, [locale]);

  useEffect(() => {
    async function loadData() {
      try {
        const [config] = await Promise.all([
          getLandingConfig(),
          loadCollections(),
          loadPhotos()
        ]);

        reset({
          ...config,
          flashSaleDiscount: config.flashSaleDiscount || 0,
          flashSaleEndDate: config.flashSaleEndDate 
            ? new Date(config.flashSaleEndDate).toISOString().slice(0, 16) 
            : null,
          manualFlashSaleIds: config.manualFlashSaleIds && config.manualFlashSaleIds.length > 0
            ? config.manualFlashSaleIds
            : config.manualFlashSaleId ? [config.manualFlashSaleId] : [],
        });

        // Merge collections into sectionsOrder if missing
        const currentOrder = config.sectionsOrder || [];
        setSectionsOrder(currentOrder);
      } catch {
        toast.error(locale === "ar" ? "فشل في تحميل الإعدادات" : "Failed to load configuration");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reset, loadCollections, loadPhotos, locale]);

  // Update sectionsOrder when collections change
  useEffect(() => {
    if (loading) return;

    setSectionsOrder(prevOrder => {
        let currentOrder = [...prevOrder];
        const collectionIds = collections.map(c => `collection_${c.id}`);
        
        // Add new collections to the top (or bottom) if not present
        const newCollections = collectionIds.filter(id => !currentOrder.includes(id));
        if (newCollections.length > 0) {
            // Add after hero if possible, else at start
            const heroIndex = currentOrder.indexOf("hero");
            if (heroIndex !== -1) {
                currentOrder.splice(heroIndex + 1, 0, ...newCollections);
            } else {
                currentOrder = [...newCollections, ...currentOrder];
            }
        }
        
        // Filter out deleted collections from order
        currentOrder = currentOrder.filter(id => {
            if (id.startsWith("collection_")) {
                return collectionIds.includes(id);
            }
            return true;
        });

        return currentOrder;
    });
  }, [collections, loading]);
  const onSubmit = async (values: any) => {
    setSaving(true);
    try {
      await updateLandingConfig({
        ...values,
        sectionsOrder,
        flashSaleEndDate: values.flashSaleEndDate ? new Date(values.flashSaleEndDate) : null,
      });
      toast.success(locale === "ar" ? "تم تحديث الصفحة الرئيسية بنجاح" : "Landing page updated successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(locale === "ar" ? `فشل في تحديث الإعدادات: ${error.message || ""}` : `Failed to update configuration: ${error.message || ""}`);
    } finally {
      setSaving(false);
    }
  };

  const onSuccess = (result: any) => {
    if (result?.info?.secure_url) {
      setValue("heroImage", result.info.secure_url);
      toast.success(locale === "ar" ? "تم رفع صورة البداية!" : "Hero image uploaded!");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeSections = sectionsOrder.map((id) => {
    if (id.startsWith("collection_")) {
        const collectionId = id.replace("collection_", "");
        const collection = collections.find(c => c.id === collectionId);
        return {
            id,
            label: collection ? (locale === 'ar' ? collection.titleAr : collection.titleEn) : "Unknown Collection",
            visible: collection ? collection.isActive : false,
            isCollection: true,
            collectionId 
        };
    }

    const fieldId = id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    let fieldName = `show${fieldId}` as keyof LandingFormValues;
    if (id === 'flash_sale') {
      fieldName = 'showFlashSales' as keyof LandingFormValues;
    } else if (id === 'customer_photos') {
      fieldName = 'showCustomerPhotos' as keyof LandingFormValues;
    }

    return {
      id,
      label: SECTION_LABELS[id] || id,
      visible: !!visibility[fieldName as keyof LandingFormValues],
      isCollection: false
    };
  });

  const onToggleVisibility = async (id: string) => {
    if (id.startsWith("collection_")) {
        const collectionId = id.replace("collection_", "");
        const collection = collections.find(c => c.id === collectionId);
        if (collection) {
            // Optimistic update
            const newStatus = !collection.isActive;
            setCollections(prev => prev.map(c => c.id === collectionId ? { ...c, isActive: newStatus } : c));
            
            try {
                await toggleCollectionStatus(collectionId, newStatus);
            } catch {
                // Revert if failed
                setCollections(prev => prev.map(c => c.id === collectionId ? { ...c, isActive: !newStatus } : c));
                toast.error("Failed to update status");
            }
        }
        return;
    }

    const fieldId = id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    let fieldName = `show${fieldId}`;
    if (id === 'flash_sale') {
      fieldName = 'showFlashSales';
    } else if (id === 'customer_photos') {
      fieldName = 'showCustomerPhotos';
    }

    setValue(fieldName as any, !visibility[fieldName as keyof typeof visibility]);
  };

  return (
    <div className="p-3 sm:p-4 md:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-24 lg:pb-8" dir={dir}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-neutral-900 text-white p-4 sm:p-6 rounded-2xl shadow-xl border border-white/10 gap-4">
        <div className="flex items-center gap-3">
          <Settings2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight">
               {t("landingCmsTitle")}
            </h1>
            <p className="text-neutral-400 text-[10px] sm:text-sm mt-0.5">{t("landingCmsSubtitle")}</p>
          </div>
        </div>
        
        {/* DESKTOP SAVE BUTTON */}
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={saving}
          className="hidden md:flex bg-[#d8a868] hover:bg-[#c6975a] text-white px-8 py-6 rounded-full text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          {t("saveAllChanges")}
        </Button>

        {/* MOBILE SAVE BUTTON (FIXED) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={saving}
            className="w-full h-12 bg-[#d8a868] hover:bg-[#c6975a] text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {t("saveAllChanges")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="bg-white border border-neutral-200 p-1 rounded-xl sm:rounded-full mb-6 sm:mb-8 w-full md:w-auto h-auto flex-wrap shadow-sm">
          <TabsTrigger value="layout" className="flex-1 sm:flex-none rounded-lg sm:rounded-full px-4 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-[#d8a868] data-[state=active]:text-white flex items-center justify-center gap-2 text-neutral-600 hover:text-primary hover:bg-neutral-50 transition-all font-medium text-xs sm:text-sm">
            <Layout className="w-4 h-4" /> {t("tabLayoutOrder")}
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex-1 sm:flex-none rounded-lg sm:rounded-full px-4 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-[#d8a868] data-[state=active]:text-white flex items-center justify-center gap-2 text-neutral-600 hover:text-primary hover:bg-neutral-50 transition-all font-medium text-xs sm:text-sm">
            <Images className="w-4 h-4" /> {t("tabHeroBanner")}
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex-1 sm:flex-none rounded-lg sm:rounded-full px-4 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-[#d8a868] data-[state=active]:text-white flex items-center justify-center gap-2 text-neutral-600 hover:text-primary hover:bg-neutral-50 transition-all font-medium text-xs sm:text-sm">
             <Package className="w-4 h-4" /> {dir === 'rtl' ? 'المجموعات' : 'Collections'}
          </TabsTrigger>
          <TabsTrigger value="flash" className="flex-1 sm:flex-none rounded-lg sm:rounded-full px-4 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-[#d8a868] data-[state=active]:text-white flex items-center justify-center gap-2 text-neutral-600 hover:text-primary hover:bg-neutral-50 transition-all font-medium text-xs sm:text-sm">
            <Gift className="w-4 h-4" /> {t("tabFlashSales")}
          </TabsTrigger>
          <TabsTrigger value="social" className="flex-1 sm:flex-none rounded-lg sm:rounded-full px-4 sm:px-6 py-2 sm:py-2.5 data-[state=active]:bg-[#d8a868] data-[state=active]:text-white flex items-center justify-center gap-2 text-neutral-600 hover:text-primary hover:bg-neutral-50 transition-all font-medium text-xs sm:text-sm">
            <Camera className="w-4 h-4" /> {t("tabSocial")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
          <SortableSectionList 
            sections={activeSections} 
            onOrderChange={setSectionsOrder}
            onVisibilityToggle={onToggleVisibility}
          />
        </TabsContent>

        <TabsContent value="hero" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="rounded-2xl border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-neutral-50 border-b p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold">{t("heroSectionContent")}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
                <div className="space-y-6">
                  <div className="grid gap-4 sm:gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-neutral-500">{t("heroTitleEnLabel")}</label>
                        <Input {...register("heroTitleEn")} className="h-11 sm:h-12 rounded-xl border-neutral-200 focus:ring-primary text-sm sm:text-base" dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] sm:text-sm font-bold text-right uppercase tracking-wider text-neutral-500" dir="rtl">{t("heroTitleArLabel")}</label>
                        <Input {...register("heroTitleAr")} className="h-11 sm:h-12 rounded-xl border-neutral-200 focus:ring-primary text-right font-medium text-sm sm:text-base" dir="rtl" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-neutral-500">{t("heroSubtitleEnLabel")}</label>
                        <Input {...register("heroSubtitleEn")} className="h-11 sm:h-12 rounded-xl border-neutral-200 focus:ring-primary text-sm sm:text-base" dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] sm:text-sm font-bold text-right uppercase tracking-wider text-neutral-500" dir="rtl">{t("heroSubtitleArLabel")}</label>
                        <Input {...register("heroSubtitleAr")} className="h-11 sm:h-12 rounded-xl border-neutral-200 focus:ring-primary text-right text-sm sm:text-base" dir="rtl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-neutral-500">{t("heroButtonTextEnLabel")}</label>
                        <Input {...register("heroButtonTextEn")} className="h-11 sm:h-12 rounded-xl border-neutral-200 focus:ring-primary text-sm sm:text-base" dir="ltr" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] sm:text-sm font-bold text-right uppercase tracking-wider text-neutral-500" dir="rtl">{t("heroButtonTextArLabel")}</label>
                        <Input {...register("heroButtonTextAr")} className="h-11 sm:h-12 rounded-xl border-neutral-200 focus:ring-primary text-right text-sm sm:text-base" dir="rtl" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-neutral-500">Button Link</label>
                      <Input {...register("heroLink")} className="h-11 sm:h-12 rounded-xl border-neutral-200 focus:ring-primary text-sm sm:text-base" placeholder="/shop or /category/..." dir="ltr" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-neutral-500">{t("heroImagePreview")}</label>
                  <div className="aspect-video relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                    {heroImage ? (
                      <Image src={heroImage} alt="Hero Preview" fill className="object-cover transition-transform group-hover:scale-105 duration-700" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                        <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Upload className="w-8 h-8 sm:w-12 sm:h-12 mb-2 z-10" />
                        <p className="z-10 text-xs sm:text-base">{t("noImageUploaded")}</p>
                      </div>
                    )}
                  </div>
                  <VercelBlobUpload 
                    uploadAction={uploadHeroImage}
                    onSuccess={(url) => {
                      setValue("heroImage", url);
                      toast.success(locale === "ar" ? "تم رفع صورة البداية!" : "Hero image uploaded!");
                    }}
                    buttonText={t("changeBannerImage")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
           <CollectionManager 
             collections={collections} 
             onRefresh={loadCollections} 
             isLoading={refreshing}
           />
           
           <div className="my-10 border-t border-neutral-200" />
           
           <div className="space-y-10">
             <div className="flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-neutral-500" />
                <h3 className="text-xl font-bold text-neutral-800">{t("manualCollectionsTitle") || (locale === 'ar' ? "المجموعات الثابتة" : "Static Collections")}</h3>
             </div>
             
             <ProductPicker 
               title={t("manualNewArrivalsTitle")}
               selectedIds={watch("manualNewArrivalIds") || []}
               onChange={(ids) => setValue("manualNewArrivalIds", ids)}
             />
             <ProductPicker 
               title={t("manualBestSellersTitle")}
               selectedIds={watch("manualBestSellerIds") || []}
               onChange={(ids) => setValue("manualBestSellerIds", ids)}
             />
           </div>
        </TabsContent>


        <TabsContent value="flash" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="rounded-2xl border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-orange-50 border-b p-4 sm:p-6">
              <CardTitle className="text-orange-900 flex items-center gap-2 text-base sm:text-lg font-bold">
                <Gift className="w-5 h-5" /> {t("flashSaleSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-8 sm:space-y-10">
              <div className="flex flex-col gap-8 sm:gap-12">
                <div className="space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-orange-900/70">{t("flashSaleDiscountLabel") || (locale === 'ar' ? "نسبة الخصم (%)" : "Discount Percentage (%)")}</label>
                      <div className="relative">
                        <Input 
                          type="number" 
                          min="0" 
                          max="100" 
                          {...register("flashSaleDiscount")} 
                          className="h-12 sm:h-14 rounded-xl border-orange-200/50 bg-white/50 focus:ring-orange-500/50 font-black text-xl sm:text-2xl text-orange-600 text-center" 
                          dir="ltr" 
                        />
                        <span className="absolute top-1/2 -translate-y-1/2 right-4 text-orange-300 font-bold text-base sm:text-lg">%</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-orange-600/60 font-medium text-center">
                        {locale === 'ar' ? "سيتم تطبيق هذا الخصم على جميع المنتجات المختارة" : "This discount will be applied to all selected products"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-orange-900/70">{t("endDateLabel")}</label>
                      <div className="relative h-12 sm:h-14">
                        <Calendar className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-orange-400 pointer-events-none z-10", isRtl ? "right-4" : "left-4")} />
                        <Input 
                          type="datetime-local" 
                          {...register("flashSaleEndDate")} 
                          className={cn("h-full rounded-xl border-orange-200/50 bg-white/50 focus:ring-orange-500/50 font-medium text-sm sm:text-lg", isRtl ? "pr-10 sm:pr-12" : "pl-10 sm:pl-12")}
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-5 bg-linear-to-br from-orange-100/50 to-orange-50/50 rounded-xl sm:rounded-2xl border border-orange-200/50 flex gap-3 sm:gap-4 items-start shadow-sm">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-orange-900 font-bold">
                        {locale === 'ar' ? "تنبيه هام" : "Important Note"}
                      </p>
                      <p className="text-[10px] sm:text-sm text-orange-800/80 leading-relaxed">
                        {t("flashSaleCaution") || (locale === 'ar' ? "عند انتهاء الوقت، سيختفي القسم تلقائياً من الصفحة الرئيسية." : "When the timer ends, this section will automatically disappear from the homepage.")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-orange-100 w-full" />

                <div className="space-y-4">
                  <label className="text-[10px] sm:text-sm font-bold uppercase tracking-wider text-neutral-500">{t("featuredFlashSaleProducts")}</label>
                  <ProductPicker 
                    title="" 
                    selectedIds={watch("manualFlashSaleIds") || []}
                    onChange={(ids) => setValue("manualFlashSaleIds", ids)}
                    variant="compact"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
          <CustomerPhotosManager photos={customerPhotos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
