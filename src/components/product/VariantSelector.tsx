"use client";

import { useMemo } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { Badge } from "@/components/ui/badge";

export type Variant = {
  id: string;
  weightGram: number;
  flavorAr: string | null;
  flavorEn: string | null;
  packageTypeAr: string | null;
  packageTypeEn: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  isDefault: boolean;
  sku: string | null;
  // UI backwards compatibility
  sizeNameAr?: string | null;
  sizeNameEn?: string | null;
  colorAr?: string | null;
  colorEn?: string | null;
  detailedSizeAr?: string | null;
  detailedSizeEn?: string | null;
  showPrice?: boolean;
};

type VariantSelectorProps = {
  variants: Variant[];
  onVariantChange: (variant: Variant) => void;
  activeVariantId: string;
};

export function VariantSelector({
  variants,
  onVariantChange,
  activeVariantId,
}: VariantSelectorProps) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  const currency = isAr ? "ج.م" : "EGP";

  // Memoize discount calculations
  const variantsWithDiscount = useMemo(
    () =>
      variants.map((v) => {
        const price = Number(v.price);
        const discount = v.discountPrice ? Number(v.discountPrice) : null;
        const hasDiscount = discount !== null && discount > 0 && discount < price;
        const discountPercent = hasDiscount
          ? Math.round(((price - discount!) / price) * 100)
          : 0;
        const finalPrice = hasDiscount ? discount! : price;

        const weightLabel =
          v.weightGram >= 1000
            ? `${v.weightGram / 1000} ${isAr ? "كجم" : "kg"}`
            : `${v.weightGram} ${isAr ? "جم" : "g"}`;

        const flavorLabel = isAr
          ? v.flavorAr || ""
          : v.flavorEn || "";

        return {
          ...v,
          price,
          finalPrice,
          hasDiscount,
          discountPercent,
          weightLabel,
          flavorLabel,
        };
      }),
    [variants, isAr]
  );

  if (variants.length <= 1) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-[10px] sm:text-xs text-neutral-400 uppercase tracking-widest">
        {isAr ? "الوزن والعبوة" : "Select Weight & Packaging"}
      </h4>
      <div className="flex flex-wrap gap-2.5">
        {variantsWithDiscount.map((v) => {
          const isSelected = v.id === activeVariantId;
          const isOutOfStock = v.stock <= 0;

          return (
            <button
              key={v.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onVariantChange(v)}
              className={`group relative flex flex-col items-start p-3 sm:p-3.5 rounded-xl border text-sm transition-all duration-200 ${
                isSelected
                  ? "border-amber-600 bg-amber-50/50 shadow-sm"
                  : "border-neutral-200 hover:border-neutral-300 bg-white"
              } ${isOutOfStock ? "opacity-50 cursor-not-allowed bg-neutral-50" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 font-cairo">
                  {v.weightLabel}
                </span>
                {v.flavorLabel && (
                  <span className="text-xs text-neutral-500">
                    ({v.flavorLabel})
                  </span>
                )}
                {v.hasDiscount && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    -{v.discountPercent}%
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-1 font-cairo text-xs">
                <span className="font-bold text-amber-700">
                  {v.finalPrice} {currency}
                </span>
                {v.hasDiscount && (
                  <span className="text-neutral-400 line-through text-[11px]">
                    {v.price} {currency}
                  </span>
                )}
              </div>

              {isOutOfStock && (
                <span className="text-[10px] text-red-500 font-medium mt-1">
                  {isAr ? "نفدت الكمية" : "Out of Stock"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
