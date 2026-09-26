"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/use-image-upload";
import { useLocale } from "@/i18n/LocaleContext";
import { toast } from "sonner";
import { 
  Package, 
  X, 
  Loader2, 
  Info,
  Plus,
  Settings,
  Globe,
  Truck,
  Star,
  Trash,
  PlusCircle,
  ImagePlus,
  Layers,
  Save,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { createProduct, updateProduct, deleteProductImage } from "@/actions/product";

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isMain: boolean;
  sortOrder: number;
}

interface ProductVariant {
  id?: string;
  detailedSizeAr?: string | null;
  detailedSizeEn?: string | null;
  colorAr?: string | null;
  colorEn?: string | null;
  price: string | number;
  discountPrice?: string | number | null;
  stock: string | number;
  isDefault: boolean;
  showPrice: boolean;
  sku?: string | null;
}

interface ProductFormInitialData {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  categoryId: string;
  descAr?: string | null;
  descEn?: string | null;
  materialAr?: string | null;
  materialEn?: string | null;
  madeInAr?: string | null;
  madeInEn?: string | null;
  warrantyAr?: string | null;
  warrantyEn?: string | null;
  recommendedSize?: string | null;
  installmentInfoAr?: string | null;
  installmentInfoEn?: string | null;
  deliveryInstallationAr?: string | null;
  deliveryInstallationEn?: string | null;
  isVisible?: boolean;
  isFeatured?: boolean;
  images: ProductImage[];
  variants: (ProductVariant & { 
    createdAt?: Date | string | null; 
    productId?: string | null;
    sizeNameAr?: string | null;
    sizeNameEn?: string | null;
    sortOrder?: number | null;
  })[];
}

interface ProductFormProps {
  categories: { id: string; nameEn: string; nameAr: string }[];
  initialData?: ProductFormInitialData;
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const [isPending, setIsPending] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imagesMeta, setImagesMeta] = useState<{ altText: string; isMain: boolean }[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>(initialData?.images || []);
  
  const isEditing = !!initialData;

  // Expanded state management for technical schema
  const [formData, setFormData] = useState({
    nameAr: initialData?.nameAr || "",
    nameEn: initialData?.nameEn || "",
    slug: initialData?.slug || "",
    categoryId: initialData?.categoryId || "",
    descAr: initialData?.descAr || "",
    descEn: initialData?.descEn || "",
    // Technical Specs
    materialAr: initialData?.materialAr || "",
    materialEn: initialData?.materialEn || "",
    madeInAr: initialData?.madeInAr || "",
    madeInEn: initialData?.madeInEn || "",
    warrantyAr: initialData?.warrantyAr || "",
    warrantyEn: initialData?.warrantyEn || "",
    recommendedSize: initialData?.recommendedSize || "",
    // Logistics
    installmentInfoAr: initialData?.installmentInfoAr || "",
    installmentInfoEn: initialData?.installmentInfoEn || "",
    deliveryInstallationAr: initialData?.deliveryInstallationAr || "",
    deliveryInstallationEn: initialData?.deliveryInstallationEn || "",
    isActive: initialData?.isVisible ?? true,
    isFeatured: initialData?.isFeatured ?? false,
  });

  // Dynamic Variants State
  const [variants, setVariants] = useState<ProductVariant[]>(
    initialData?.variants?.length 
      ? initialData.variants.map((v) => ({
          id: v.id,
          detailedSizeAr: v.detailedSizeAr || "",
          detailedSizeEn: v.detailedSizeEn || "",
          colorAr: v.colorAr || "",
          colorEn: v.colorEn || "",
          price: v.price.toString(),
          discountPrice: v.discountPrice?.toString() || "",
          stock: v.stock.toString(),
          isDefault: v.isDefault,
          showPrice: v.showPrice ?? true,
          sku: v.sku ?? undefined
        }))
      : [{
          detailedSizeAr: "",
          detailedSizeEn: "",
          colorAr: "",
          colorEn: "",
          price: "",
          discountPrice: "",
          stock: "0",
          isDefault: true,
          showPrice: true,
        }]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // Auto-slug from English name
    if (name === "nameEn" && !formData.slug && !isEditing) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  const handleCategoryChange = (val: string) => {
    setFormData(prev => ({ ...prev, categoryId: val }));
    if (errors.categoryId) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.categoryId;
        return next;
      });
    }
  };

  const { isDragging, dragHandlers, handlePaste, processFiles } = useImageUpload({
    onFilesSelected: (selectedFiles) => {
      setImages((prev) => [...prev, ...selectedFiles]);
      const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
      
      // Initialize meta for new images
      setImagesMeta(prev => [
        ...prev,
        ...selectedFiles.map(() => ({ altText: "", isMain: false }))
      ]);
    },
    multiple: true,
    maxSizeMB: 50 // Increased from default 10MB
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذه الصورة؟" : "Are you sure you want to delete this image?")) return;
    
    try {
      const result = await deleteProductImage(imageId);
      if (result.success) {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        toast.success(isAr ? "تم حذف الصورة" : "Image deleted");
      } else {
        toast.error(result.error || (isAr ? "فشل حذف الصورة" : "Failed to delete image"));
      }
    } catch {
      toast.error(isAr ? "خطأ في حذف الصورة" : "Error deleting image");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // --- Variants Management ---
  const addVariant = () => {
    setVariants(prev => [...prev, {
      detailedSizeAr: "",
      detailedSizeEn: "",
      colorAr: "",
      colorEn: "",
      price: "",
      discountPrice: "",
      stock: "10",
      isDefault: false,
      showPrice: true,
    }]);
  };

  const applyBulkDiscount = (value: string, type: "percent" | "fixed") => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const newVariants = variants.map(v => {
      const price = parseFloat(v.price.toString());
      if (isNaN(price)) return v;

      let discountPrice = price;
      if (type === "percent") {
        discountPrice = price * (1 - numValue / 100);
      } else {
        discountPrice = price - numValue;
      }

      return {
        ...v,
        discountPrice: Math.max(0, discountPrice).toFixed(2).toString()
      };
    });

    setVariants(newVariants);
    toast.success(isAr ? "تم تطبيق الخصم على جميع البدائل" : "Discount applied to all variants");
  };

  const clearAllDiscounts = () => {
    setVariants(variants.map(v => ({ ...v, discountPrice: "" })));
    toast.info(isAr ? "تم مسح جميع الخصومات" : "All discounts cleared");
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) {
      toast.error(isAr ? "مطلوب بديل واحد على الأقل" : "At least one variant is required");
      return;
    }
    const wasDefault = variants[index].isDefault;
    const newVariants = variants.filter((_, i) => i !== index);
    if (wasDefault && newVariants.length > 0) {
      newVariants[0].isDefault = true;
    }
    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | boolean) => {
    setVariants(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const toggleDefaultVariant = (index: number) => {
    setVariants(prev => prev.map((v, i) => ({
      ...v,
      isDefault: i === index
    })));
  };

  // --- Gallery Metadata Management ---
  const updateExistingImageMeta = (id: string, field: keyof ProductImage, value: string | boolean | number) => {
    setExistingImages(prev => prev.map(img => 
      img.id === id ? { ...img, [field]: value } : img
    ));
    if (field === "isMain" && value === true) {
      setExistingImages(prev => prev.map(img => img.id !== id ? { ...img, isMain: false } : img));
      setImagesMeta(prev => prev.map(img => ({ ...img, isMain: false })));
    }
  };

  const updateNewImageMeta = (index: number, field: "altText" | "isMain", value: string | boolean) => {
    setImagesMeta(prev => {
      const next = [...prev];
      if (!next[index]) next[index] = { altText: "", isMain: false };
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    if (field === "isMain" && value === true) {
      setImagesMeta(prev => prev.map((img, i) => i !== index ? { ...img, isMain: false } : img));
      setExistingImages(prev => prev.map(img => ({ ...img, isMain: false })));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nameAr) newErrors.nameAr = "اسم المنتج مطلوب";
    if (!formData.nameEn) newErrors.nameEn = "English name is required";
    // if (!formData.slug) newErrors.slug = "Slug is required"; // Auto-generated on server if empty
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.descAr) newErrors.descAr = "الوصف مطلوب";
    if (!formData.descEn) newErrors.descEn = "Description is required";
    
    // Validate Variants
    variants.forEach((v, i) => {
      if (!v.price || isNaN(Number(v.price))) newErrors[`variant-${i}-price`] = "Price required";
      // Size and color are optional
    });

    if (!isEditing && images.length === 0 && existingImages.length === 0) {
      newErrors.images = "At least one image is required";
    }

    // Check if at least one variant is default
    if (!variants.some(v => v.isDefault)) {
      newErrors.defaultVariant = isAr ? "يرجى اختيار البديل الافتراضي" : "Please select a default variant";
    }

    // Check if at least one image is main
    const hasMain = existingImages.some(img => img.isMain) || imagesMeta.some(img => img.isMain);
    if (!hasMain) {
      newErrors.mainImage = isAr ? "يرجى اختيار صورة رئيسية" : "Please pick a main image";
    }

    // setErrors(newErrors); // Handled in handleSubmit
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Create a summary of missing fields
      const missingFields = Object.values(validationErrors).join("\n");
      toast.error(
        <div className="space-y-2">
          <p className="font-bold">{t("fillRequired")}</p>
          <pre className="text-xs text-left whitespace-pre-wrap font-sans opacity-80">{missingFields}</pre>
        </div>
      );
      return;
    }

    // Validate total size of new images
    const totalSize = images.reduce((acc, img) => acc + img.size, 0);
    const maxSize = 500 * 1024 * 1024; // 500MB - matching next.config.ts
    if (totalSize > maxSize) {
      toast.error(isAr 
        ? "حجم الصور الإجمالي كبير جداً. يرجى تقليل عدد أو حجم الصور (الحد الأقصى 500 ميجابايت)."
        : `Total size of new images is too large (${(totalSize / (1024 * 1024)).toFixed(2)}MB). Maximum allowed is 500MB.`
      );
      return;
    }

    setIsPending(true);
    const submissionData = new FormData();
    
    // Append standard fields
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, String(value));
    });

    // Append Variants as JSON
    submissionData.append("variants", JSON.stringify(variants));

    // Append Images and their Meta
    images.forEach((image) => submissionData.append("images", image));
    submissionData.append("newImagesMeta", JSON.stringify(imagesMeta));
    submissionData.append("existingImagesMeta", JSON.stringify(existingImages));

    try {
      const result = isEditing 
        ? await updateProduct(initialData.id, submissionData)
        : await createProduct(submissionData);

      if (result.success) {
        toast.success(isEditing ? (isAr ? "تم تحديث المنتج بنجاح!" : "Product updated successfully!") : (isAr ? "تم إنشاء المنتج بنجاح!" : "Product created successfully!"));
        router.push("/admin/products");
        router.refresh();
      } else {
        // Handle specific error cases (like slug collision)
        const isSlugError = result.error?.toLowerCase().includes("slug") || result.error?.toLowerCase().includes("url");
        
        if (isSlugError) {
          setErrors(prev => ({ ...prev, slug: t("slugAlreadyExists") }));
          // Scroll to the slug field
          const slugInput = document.getElementsByName("slug")[0];
          if (slugInput) {
            slugInput.scrollIntoView({ behavior: "smooth", block: "center" });
            (slugInput as HTMLInputElement).focus();
          }
        }
        
        toast.error(
          isSlugError 
            ? t("slugAlreadyExists") 
            : (result.error || (isAr ? `فشل في ${isEditing ? "تحديث" : "إنشاء"} المنتج` : `Failed to ${isEditing ? "update" : "create"} product`))
        );
      }
    } catch (error: unknown) {
      console.error("Submit error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if it's likely a size/limit error (Next.js often returns "Unexpected response" for 413)
      const isPotentialLimitError = errorMessage.toLowerCase().includes("unexpected response") || 
                                   errorMessage.toLowerCase().includes("payload too large") ||
                                   errorMessage.toLowerCase().includes("413");

      toast.error(isAr 
        ? (isPotentialLimitError 
            ? "خطأ في الرفع: قد يكون الحجم الإجمالي للصور كبيراً جداً (الحد الأقصى 500MB) أو حدث انقطاع في الاتصال." 
            : `خطأ غير متوقع: ${errorMessage}`)
        : (isPotentialLimitError 
            ? "Upload error: The total image size might be too large (max 500MB) or the connection was interrupted." 
            : `Unexpected error: ${errorMessage}`)
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-20 px-4 sm:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* MAIN CONTENT: Left 2 columns */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <Card className="rounded-2xl sm:rounded-3xl border shadow-sm border-neutral-100 overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold font-serif">{isEditing ? (isAr ? "تعديل تفاصيل المنتج" : "Edit Product Details") : t("basicInfo")}</h2>
              </div>

              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-neutral-100/50 p-1 rounded-xl">
                  <TabsTrigger value="en" className="rounded-lg font-bold">English</TabsTrigger>
                  <TabsTrigger value="ar" className="rounded-lg font-bold font-cairo">العربية</TabsTrigger>
                </TabsList>
                
                <TabsContent value="en" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-neutral-700">Product Name (EN)</Label>
                    <Input 
                      name="nameEn"
                      value={formData.nameEn}
                      onChange={handleInputChange}
                      placeholder="e.g. Modern Velvet Sofa" 
                      className={`rounded-xl h-11 border-neutral-200 ${errors.nameEn ? "border-red-500" : ""}`}
                    />
                    {errors.nameEn && <p className="text-xs text-red-500">{errors.nameEn}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-neutral-700">Description (EN)</Label>
                    <Textarea 
                      name="descEn"
                      value={formData.descEn}
                      onChange={handleInputChange}
                      placeholder="Describe your furniture piece in English..." 
                      className={`rounded-xl min-h-[150px] border-neutral-200 resize-none ${errors.descEn ? "border-red-500" : ""}`}
                    />
                    {errors.descEn && <p className="text-xs text-red-500">{errors.descEn}</p>}
                  </div>
                </TabsContent>

                <TabsContent value="ar" className="mt-6 space-y-4 text-right" dir="rtl">
                  <div className="space-y-2">
                    <Label className="text-neutral-700 font-cairo">اسم المنتج (عربي)</Label>
                    <Input 
                      name="nameAr"
                      value={formData.nameAr}
                      onChange={handleInputChange}
                      placeholder="مثال: كنبة مخملية مودرن" 
                      className={`rounded-xl h-11 border-neutral-200 font-cairo ${errors.nameAr ? "border-red-500" : ""}`}
                    />
                    {errors.nameAr && <p className="text-xs text-red-500 font-cairo">{errors.nameAr}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-neutral-700 font-cairo">الوصف (عربي)</Label>
                    <Textarea 
                      name="descAr"
                      value={formData.descAr}
                      onChange={handleInputChange}
                      placeholder="صف قطعة الأثاث بالتفصيل..." 
                      className={`rounded-xl min-h-[150px] border-neutral-200 font-cairo resize-none ${errors.descAr ? "border-red-500" : ""}`}
                    />
                    {errors.descAr && <p className="text-xs text-red-500 font-cairo">{errors.descAr}</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* TECHNICAL SPECS SECTION */}
          <Card className="rounded-2xl sm:rounded-3xl border shadow-sm border-neutral-100 overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A]">{t("techSpecs")}</h2>
              </div>

              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-neutral-100/50 p-1 rounded-xl">
                  <TabsTrigger value="en" className="rounded-lg font-bold text-xs sm:text-sm">English</TabsTrigger>
                  <TabsTrigger value="ar" className="rounded-lg font-bold font-cairo text-xs sm:text-sm">العربية</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-neutral-700">{t("materialLabel")}</Label>
                    <Input name="materialEn" value={formData.materialEn} onChange={handleInputChange} placeholder="e.g. Solid Oak Wood" className="rounded-xl h-10 sm:h-11 border-neutral-200 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-neutral-700">{t("madeInLabel")}</Label>
                    <Input name="madeInEn" value={formData.madeInEn} onChange={handleInputChange} placeholder="e.g. Turkey" className="rounded-xl h-10 sm:h-11 border-neutral-200 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-neutral-700">{t("warrantyLabel")}</Label>
                    <Input name="warrantyEn" value={formData.warrantyEn} onChange={handleInputChange} placeholder="e.g. 5 Years Limited" className="rounded-xl h-10 sm:h-11 border-neutral-200 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-neutral-700 font-bold uppercase tracking-wider">{t("recommendedSizeLabel")}</Label>
                    <Input name="recommendedSize" value={formData.recommendedSize} onChange={handleInputChange} placeholder="e.g. 240cm x 100cm" className="rounded-xl h-14 text-lg font-bold border-neutral-200" />
                  </div>
                </TabsContent>

                <TabsContent value="ar" className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-right" dir="rtl">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-neutral-700 font-cairo">{t("materialLabel")}</Label>
                    <Input name="materialAr" value={formData.materialAr} onChange={handleInputChange} placeholder="مثال: خشب بلوط صلب" className="rounded-xl h-10 sm:h-11 border-neutral-200 font-cairo text-right text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-neutral-700 font-cairo">{t("madeInLabel")}</Label>
                    <Input name="madeInAr" value={formData.madeInAr} onChange={handleInputChange} placeholder="مثال: تركيا" className="rounded-xl h-10 sm:h-11 border-neutral-200 font-cairo text-right text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-neutral-700 font-cairo">{t("warrantyLabel")}</Label>
                    <Input name="warrantyAr" value={formData.warrantyAr} onChange={handleInputChange} placeholder="مثال: ضمان 5 سنوات" className="rounded-xl h-10 sm:h-11 border-neutral-200 font-cairo text-right text-sm" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* LOGISTICS & DELIVERY */}
          <Card className="rounded-2xl sm:rounded-3xl border shadow-sm border-neutral-100 overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A]">{t("logistics")}</h2>
              </div>

              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-neutral-100/50 p-1 rounded-xl">
                  <TabsTrigger value="en" className="rounded-lg font-bold text-xs sm:text-sm">English</TabsTrigger>
                  <TabsTrigger value="ar" className="rounded-lg font-bold font-cairo text-xs sm:text-sm">العربية</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-neutral-700">{t("installmentLabel")}</Label>
                    <Input name="installmentInfoEn" value={formData.installmentInfoEn} onChange={handleInputChange} placeholder="e.g. 0% interest for 12 months" className="rounded-xl h-10 sm:h-11 border-neutral-200 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-neutral-700">{t("deliveryLabel")}</Label>
                    <Textarea name="deliveryInstallationEn" value={formData.deliveryInstallationEn} onChange={handleInputChange} placeholder="Describe delivery terms..." className="rounded-xl min-h-[100px] border-neutral-200 text-sm" />
                  </div>
                </TabsContent>

                <TabsContent value="ar" className="mt-6 space-y-4 text-right" dir="rtl">
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-neutral-700 font-cairo">{t("installmentLabel")}</Label>
                    <Input name="installmentInfoAr" value={formData.installmentInfoAr} onChange={handleInputChange} placeholder="مثال: تقسيط 0% لمدة 12 شهر" className="rounded-xl h-10 sm:h-11 border-neutral-200 font-cairo text-right text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs sm:text-sm text-neutral-700 font-cairo">{t("deliveryLabel")}</Label>
                    <Textarea name="deliveryInstallationAr" value={formData.deliveryInstallationAr} onChange={handleInputChange} placeholder="تفاصيل التوصيل والتركيب..." className="rounded-xl min-h-[100px] border-neutral-200 font-cairo text-right text-sm" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* VARIANTS MANAGER */}
          <Card className="rounded-2xl sm:rounded-3xl border shadow-sm border-neutral-100 overflow-hidden">
            <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A]">{t("variantsStock")}</h2>
                </div>
                <Button 
                  type="button" 
                  onClick={addVariant}
                  variant="outline"
                  className="rounded-xl border-primary text-primary hover:bg-primary/10 flex items-center justify-center gap-2 h-10 sm:h-11 px-6 w-full sm:w-auto"
                >
                  <PlusCircle className="h-4 w-4" />
                  {t("addVariantBtn")}
                </Button>
              </div>

              {errors.defaultVariant && <p className="text-xs text-red-500 px-2">{errors.defaultVariant}</p>}

              <div className="space-y-4 sm:space-y-6">
                {/* Bulk Actions */}
                {variants.length > 0 && (
                  <div className="p-3 sm:p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-3">
                    <div className="flex items-center gap-2 text-orange-700">
                      <Star className="h-4 w-4 fill-orange-500" />
                      <span className="text-xs sm:text-sm font-bold">{isAr ? "أدوات الخصم الجماعي" : "Bulk Discount Tools"}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-orange-100 shadow-sm flex-1 sm:flex-none min-w-[120px]">
                        <Input 
                          type="number" 
                          id="bulk-percent"
                          placeholder="20" 
                          className="w-full sm:w-20 h-10 text-base font-bold border-none focus-visible:ring-0 text-center" 
                        />
                        <Button 
                          type="button"
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-[10px] sm:text-xs font-bold text-orange-600 hover:bg-orange-50 whitespace-nowrap"
                          onClick={() => {
                            const val = (document.getElementById("bulk-percent") as HTMLInputElement).value;
                            applyBulkDiscount(val, "percent");
                          }}
                        >
                          % {isAr ? "خصم" : "Discount"}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-orange-100 shadow-sm flex-1 sm:flex-none min-w-[140px]">
                        <Input 
                          type="number" 
                          id="bulk-fixed"
                          placeholder="50" 
                          className="w-full sm:w-24 h-10 text-base font-bold border-none focus-visible:ring-0 text-center" 
                        />
                        <Button 
                          type="button"
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-[10px] sm:text-xs font-bold text-orange-600 hover:bg-orange-50 whitespace-nowrap"
                          onClick={() => {
                            const val = (document.getElementById("bulk-fixed") as HTMLInputElement).value;
                            applyBulkDiscount(val, "fixed");
                          }}
                        >
                          {isAr ? "ر.س خصم" : "SAR Discount"}
                        </Button>
                      </div>
                      <Button 
                        type="button"
                        size="sm" 
                        variant="ghost" 
                        className="h-11 px-2 sm:px-4 text-[10px] sm:text-xs font-medium text-neutral-400 hover:text-red-500 flex-1 sm:flex-none"
                        onClick={clearAllDiscounts}
                      >
                        {isAr ? "مسح التخفيضات" : "Clear Discounts"}
                      </Button>
                    </div>
                  </div>
                )}
                {variants.map((variant, index) => (
                  <div key={index} className={`p-4 rounded-2xl border transition-all ${variant.isDefault ? "border-primary bg-primary/5" : "border-neutral-100 bg-neutral-50/50"}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={variant.isDefault ? "default" : "outline"} className={variant.isDefault ? "bg-primary text-white border-none" : "text-neutral-400"}>
                          {variant.isDefault ? t("default") : (isAr ? `البديل #${index + 1}` : `Variant #${index + 1}`)}
                        </Badge>
                        {variant.sku && <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[100px]">{variant.sku}</span>}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        {!variant.isDefault && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleDefaultVariant(index)}
                            className="text-[10px] sm:text-xs text-primary hover:text-primary hover:bg-white h-8"
                          >
                            {isAr ? "تعيين كافتراضي" : "Set as Default"}
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeVariant(index)}
                          className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50 ml-auto sm:ml-0"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4 p-2 bg-white rounded-xl border border-neutral-100 w-fit">
                      <Label className="text-[10px] sm:text-xs font-bold text-neutral-600 flex items-center gap-2 cursor-pointer">
                        <Input 
                          type="checkbox"
                          checked={variant.showPrice}
                          onChange={(e) => updateVariant(index, "showPrice", e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                        />
                        {isAr ? "إظهار السعر للعميل" : "Show Price to Customer"}
                      </Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Size (EN)</Label>
                        <Input 
                          value={variant.detailedSizeEn || ""} 
                          onChange={(e) => updateVariant(index, "detailedSizeEn", e.target.value)}
                          placeholder="e.g. 200x100" 
                          className="rounded-lg h-10 text-sm border-neutral-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Size (AR)</Label>
                        <Input 
                          value={variant.detailedSizeAr || ""} 
                          onChange={(e) => updateVariant(index, "detailedSizeAr", e.target.value)}
                          placeholder="مثال: 200x100" 
                          className="rounded-lg h-10 text-sm border-neutral-200 font-cairo text-right" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Color (EN/AR)</Label>
                        <div className="grid grid-cols-2 gap-1">
                          <Input 
                            value={variant.colorEn || ""} 
                            onChange={(e) => updateVariant(index, "colorEn", e.target.value)}
                            placeholder="EN" 
                            className="rounded-lg h-10 text-sm border-neutral-200"
                          />
                          <Input 
                            value={variant.colorAr || ""} 
                            onChange={(e) => updateVariant(index, "colorAr", e.target.value)}
                            placeholder="AR" 
                            className="rounded-lg h-10 text-sm border-neutral-200 font-cairo text-right"
                          />
                    </div>
                    </div>
                    </div>
                      
                      
                      {/* Numeric Row: Now separate and wider */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:col-span-3 pt-4 border-t border-neutral-100/50">
                        <div className="space-y-2 flex-1">
                          <Label className="text-sm text-neutral-600 font-bold uppercase tracking-wider">{t("price")}</Label>
                          <Input 
                            type="number"
                            value={variant.price} 
                            onChange={(e) => updateVariant(index, "price", e.target.value)}
                            placeholder="0.00" 
                            className={`rounded-xl h-20 text-3xl font-black text-center border-neutral-200 shadow-sm transition-all focus:scale-[1.02] ${errors[`variant-${index}-price`] ? "border-red-500 bg-red-50" : "bg-white"}`}
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <Label className="text-sm text-secondary font-bold uppercase tracking-wider">{t("discountPrice")}</Label>
                          <Input 
                            type="number"
                            value={variant.discountPrice || ""} 
                            onChange={(e) => updateVariant(index, "discountPrice", e.target.value)}
                            placeholder="0.00" 
                            className="rounded-xl h-20 text-3xl font-black text-center border-primary/20 bg-primary/5 focus:border-primary shadow-sm transition-all focus:scale-[1.02]"
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <Label className="text-sm text-neutral-600 font-bold uppercase tracking-wider">{t("stock")}</Label>
                          <Input 
                            type="number"
                            value={variant.stock} 
                            onChange={(e) => updateVariant(index, "stock", e.target.value)}
                            placeholder="0" 
                            className="rounded-xl h-20 text-3xl font-black text-center border-neutral-200 bg-white shadow-sm transition-all focus:scale-[1.02]"
                          />
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* IMAGES & GALLERY SECTION */}
          <Card 
            className={cn(
              "rounded-2xl sm:rounded-3xl border shadow-sm border-neutral-100 overflow-hidden transition-all duration-300",
              isDragging && "ring-4 ring-primary ring-offset-4 scale-[0.99] border-primary border-dashed bg-primary/5"
            )}
            {...dragHandlers}
            onPaste={handlePaste}
            tabIndex={0} // Make focusable for paste events
          >
            <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A]">{t("imageManagement")}</h2>
                </div>
                <span className="text-xs sm:text-sm text-neutral-400 font-medium font-mono">
                  {(existingImages?.length || 0) + (images?.length || 0)} {isAr ? "صور" : "images"}
                </span>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-3">
                <Label className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">{t("uploadNewImages")}</Label>
                <label
                  htmlFor="product-images"
                  className={cn(
                    "flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px] rounded-2xl border-2 border-dashed transition-all cursor-pointer group",
                    errors.images ? "border-red-500 bg-red-50/30" : "border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 hover:border-primary"
                  )}
                >
                  <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-400 group-hover:scale-110 group-hover:text-primary transition-all">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="mt-3 space-y-1 text-center">
                    <span className="text-xs sm:text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">{isAr ? "إضافة صور جديدة" : "Add New Photos"}</span>
                    <p className="text-[10px] text-neutral-400">{isAr ? "اضغط هنا لاختيار الصور" : "Click to browse gallery"}</p>
                  </div>
                  <input
                    id="product-images"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              {/* Gallery Grid */}
              <div className="space-y-4">
                {/* EXISTING IMAGES */}
                {existingImages.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">{t("existingImages")}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {existingImages.map((img, idx) => (
                        <div key={img.id || idx} className={`p-2 rounded-xl border transition-all ${img.isMain ? "border-primary bg-primary/5 shadow-sm" : "border-neutral-100 bg-white"}`}>
                          <div className="relative aspect-square rounded-lg overflow-hidden mb-2 group">
                            <Image src={img.url} alt={img.altText || ""} fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              {!img.isMain && (
                                <Button
                                  type="button"
                                  size="icon"
                                  onClick={() => updateExistingImageMeta(img.id, "isMain", true)}
                                  className="bg-white text-primary hover:bg-primary hover:text-white rounded-full h-8 w-8 p-0"
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="icon"
                                onClick={() => removeExistingImage(img.id)}
                                className="bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-full h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {img.isMain && (
                              <Badge className="absolute top-1.5 left-1.5 bg-primary text-white border-none text-[9px] px-2 py-0.5">{t("mainImage")}</Badge>
                            )}
                          </div>
                          <Input
                            placeholder={t("altText")}
                            value={img.altText || ""}
                            onChange={(e) => updateExistingImageMeta(img.id, "altText", e.target.value)}
                            className="h-8 text-[10px] rounded-lg border-neutral-100 focus-visible:ring-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NEW PREVIEWS */}
                {previews.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">{isAr ? "صور جديدة منتظرة" : "Pending New Photos"}</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {previews.map((preview, index) => {
                        const meta = imagesMeta[index] || { altText: "", isMain: false };
                        return (
                          <div key={index} className={`p-2 rounded-xl border transition-all ${meta.isMain ? "border-primary bg-primary/5 shadow-sm" : "border-neutral-100 bg-white"}`}>
                            <div className="relative aspect-square rounded-lg overflow-hidden mb-2 group">
                              <Image src={preview} alt={meta.altText || ""} fill className="object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                {!meta.isMain && (
                                  <Button
                                    type="button"
                                    size="icon"
                                    onClick={() => updateNewImageMeta(index, "isMain", true)}
                                    className="bg-white text-primary hover:bg-primary hover:text-white rounded-full h-8 w-8 p-0"
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  size="icon"
                                  onClick={() => removeImage(index)}
                                  className="bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-full h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              {meta.isMain && (
                                <Badge className="absolute top-1.5 left-1.5 bg-primary text-white border-none text-[9px] px-2 py-0.5">{t("mainImage")}</Badge>
                              )}
                              <div className="absolute bottom-0 inset-x-0 bg-emerald-500 text-white text-[8px] py-0.5 text-center font-bold uppercase">{isAr ? "جديد" : "NEW"}</div>
                            </div>
                            <Input
                              placeholder={t("altText")}
                              value={meta.altText || ""}
                              onChange={(e) => updateNewImageMeta(index, "altText", e.target.value)}
                              className="h-8 text-[10px] rounded-lg border-neutral-100 focus-visible:ring-primary"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Errors & Info */}
              <div className="space-y-3 pt-2">
                {errors.images && <p className="text-xs text-red-500 font-medium px-2 flex items-center gap-1"><Info className="h-3 w-3" /> {errors.images}</p>}
                {errors.mainImage && <p className="text-xs text-red-500 font-medium px-2 flex items-center gap-1"><Info className="h-3 w-3" /> {errors.mainImage}</p>}

                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] sm:text-xs text-neutral-600 leading-relaxed font-medium">
                    {isAr ? (
                      <>اختر صورة <strong>رئيسية</strong> لاستخدامها كصورة مميزة في القوائم. أضف <strong>نصاً بديلاً</strong> وصفياً لتحسين ظهور المنتج في نتائج محركات البحث.</>
                    ) : (
                      <>Select a <strong>Main</strong> image to be used as the featured visual for listings. Add descriptive <strong>Alt Text</strong> to improve SEO ranking in search results.</>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SIDEBAR: Right 1 column */}
        <div className="space-y-6 sm:space-y-8 lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            <Card className="rounded-2xl sm:rounded-3xl border shadow-sm border-neutral-100 overflow-hidden">
              <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A]">{t("configuration")}</h2>
                </div>

                <div className="space-y-5">
                  {/* Categories */}
                  <div className="space-y-3">
                    <Label className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">{t("categoryLabel")}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryChange(cat.id)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border text-sm transition-all text-left group",
                            formData.categoryId === cat.id 
                              ? "border-primary bg-primary/5 text-primary font-bold shadow-sm" 
                              : "border-neutral-100 bg-neutral-50/50 text-neutral-600 hover:border-neutral-200"
                          )}
                          dir={isAr ? "rtl" : "ltr"}
                        >
                          <div className={cn(
                            "h-2 w-2 rounded-full transition-transform group-hover:scale-150",
                            formData.categoryId === cat.id ? "bg-primary" : "bg-neutral-300"
                          )} />
                          <span className={isAr ? "font-cairo" : ""}>{isAr ? cat.nameAr : cat.nameEn}</span>
                        </button>
                      ))}
                    </div>
                    {errors.categoryId && <p className="text-xs text-red-500 font-medium px-1 flex items-center gap-1"><Info className="h-3 w-3" /> {errors.categoryId}</p>}
                  </div>

                  {/* URL Slug */}
                  <div className="space-y-3">
                    <Label className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-wider">{t("urlSlug")}</Label>
                    <Input 
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="url-friendly-slug" 
                      className={cn(
                        "rounded-xl h-10 sm:h-11 border-neutral-200 text-xs font-mono focus-visible:ring-primary",
                        errors.slug ? "border-red-500 bg-red-50" : ""
                      )}
                    />
                    <p className="text-[10px] text-neutral-400 italic">
                      {isAr ? "يتم إنشاؤه من الاسم الإنجليزية تلقائياً إذا ترك فارغاً." : "Auto-generated from name if left empty."}
                    </p>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50/50 border border-neutral-100 hover:border-neutral-200 transition-colors">
                    <div className="space-y-0.5">
                      <Label className="text-xs sm:text-sm font-bold text-neutral-700">{t("statusLabel")}</Label>
                      <p className="text-[11px] text-neutral-400">{formData.isActive ? t("statusActive") : t("statusInactive")}</p>
                    </div>
                    <Switch 
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  {/* Featured Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/20 transition-colors">
                    <div className="space-y-0.5">
                      <Label className="text-xs sm:text-sm font-bold text-primary flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-primary" /> {t("featuredLabel")}</Label>
                      <p className="text-[11px] text-primary/60">{t("featuredSubtitle")}</p>
                    </div>
                    <Switch 
                      checked={formData.isFeatured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ACTION BUTTONS (DESKTOP STICKY) */}
            <div className="hidden lg:flex flex-col gap-3">
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-14 font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {isAr ? "جاري الحفظ..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 transition-transform group-hover:scale-110" />
                    {isEditing ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "إضافة المنتج" : "Create Product")}
                  </>
                )
                }
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
                className="w-full h-12 rounded-xl border-neutral-200 font-bold text-neutral-500 hover:bg-neutral-50 transition-all"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE ACTION BUTTONS (FIXED BOTTOM) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-40 flex gap-3 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <Button 
          type="submit" 
          disabled={isPending}
          className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-bold transition-all flex items-center justify-center gap-2"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {isPending ? (isAr ? "حفظ..." : "Saving...") : (isEditing ? (isAr ? "حفظ" : "Save") : (isAr ? "إضافة" : "Create"))}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
          className="px-6 h-12 rounded-xl border-neutral-200 font-bold text-neutral-500"
        >
          {isAr ? "إلغاء" : "Cancel"}
        </Button>
      </div>
    </form>
  );
}
