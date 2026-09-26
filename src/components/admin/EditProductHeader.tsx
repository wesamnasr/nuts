"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/i18n/LocaleContext";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface EditProductHeaderProps {
  productNameEn: string;
  productNameAr: string;
}

export function EditProductHeader({ productNameEn, productNameAr }: EditProductHeaderProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const productName = isAr ? (productNameAr || productNameEn) : (productNameEn || productNameAr);

  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => router.back()}
        className="rounded-full hover:bg-neutral-100"
      >
        {isAr ? <ChevronRight className="h-5 w-5 rotate-180" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>
      <div>
        <h1 className="text-2xl font-bold font-serif">
          {isAr ? `تعديل: ${productName}` : `Edit: ${productName}`}
        </h1>
        <p className="text-neutral-500">
          {isAr ? "تعديل تفاصيل المنتج، الأسعار، ومعرض الصور." : "Modify product details, pricing, and media gallery."}
        </p>
      </div>
    </div>
  );
}
