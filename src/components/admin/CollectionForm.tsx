"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProductPicker } from "@/components/admin/ProductPicker";
import { createCollection, updateCollection, getCollection } from "@/actions/collections";
import { useLocale } from "@/i18n/LocaleContext";

const collectionSchema = z.object({
  titleAr: z.string().min(1, "Arabic title is required"),
  titleEn: z.string().min(1, "English title is required"),
  productIds: z.array(z.string()),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CollectionFormProps {
  collectionId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CollectionForm({ collectionId, onSuccess, onCancel }: CollectionFormProps) {
  const { t, dir } = useLocale();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      titleAr: "",
      titleEn: "",
      productIds: [],
    },
  });

  const productIds = watch("productIds");

  useEffect(() => {
    if (collectionId) {
      async function loadCollection() {
        setFetching(true);
        try {
          const res = await getCollection(collectionId!);
          if (res.success && res.data) {
            reset({
              titleAr: res.data.titleAr,
              titleEn: res.data.titleEn,
              productIds: res.data.items.map((item) => item.productId),
            });
          } else {
            toast.error("Failed to load collection details");
            onCancel();
          }
        } catch (error) {
          toast.error("Error loading collection");
        } finally {
          setFetching(false);
        }
      }
      loadCollection();
    }
  }, [collectionId, reset, onCancel]);

  const onSubmit = async (values: CollectionFormValues) => {
    setLoading(true);
    try {
      let res;
      if (collectionId) {
        res = await updateCollection(collectionId, values);
      } else {
        res = await createCollection(values);
      }

      if (res.success) {
        toast.success(collectionId ? "Collection updated!" : "Collection created!");
        onSuccess();
      } else {
        toast.error("Operation failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
           <h2 className="text-2xl font-bold tracking-tight">
            {collectionId ? (dir === 'rtl' ? 'تعديل المجموعة' : 'Edit Collection') : (dir === 'rtl' ? 'مجموعة جديدة' : 'New Collection')}
           </h2>
           <p className="text-neutral-500 text-sm">
             {dir === 'rtl' ? 'قم بتخصيص عنوان ومنتجات هذه المجموعة' : 'Customize the title and products for this collection'}
           </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="rounded-2xl border-none shadow-md overflow-hidden">
          <CardHeader className="bg-neutral-50 px-6 py-4 border-b">
            <CardTitle className="text-base">{dir === 'rtl' ? 'تفاصيل المجموعة' : 'Collection Details'}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                  {dir === 'rtl' ? 'Title (English)' : 'Title (English)'}
                </label>
                <Input
                  {...register("titleEn")}
                  className="h-12 rounded-xl border-neutral-200 focus:ring-primary"
                  placeholder="e.g. Summer Sale"
                  dir="ltr"
                />
                {errors.titleEn && <p className="text-red-500 text-xs">{errors.titleEn.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-right uppercase tracking-wider text-neutral-500 block">
                   {dir === 'rtl' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                </label>
                <Input
                  {...register("titleAr")}
                  className="h-12 rounded-xl border-neutral-200 focus:ring-primary text-right"
                  placeholder="مثال: عروض الصيف"
                  dir="rtl"
                />
                {errors.titleAr && <p className="text-red-500 text-xs text-right">{errors.titleAr.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <ProductPicker
          title={dir === 'rtl' ? 'منتجات المجموعة' : 'Collection Products'}
          selectedIds={productIds}
          onChange={(ids) => setValue("productIds", ids)}
        />
      </div>

      <div className="flex justify-end pt-4 pb-20">
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          className="rounded-xl px-8 py-6 text-lg font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white min-w-[200px]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          {dir === 'rtl' ? 'حفظ المجموعة' : 'Save Collection'}
        </Button>
      </div>
    </div>
  );
}
