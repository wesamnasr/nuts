"use client";

import { useMemo } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { Badge } from "@/components/ui/badge";

export type Variant = {
  id: string;
  sizeNameAr: string | null;
  sizeNameEn: string | null;
  colorAr: string | null;
  colorEn: string | null;
  detailedSizeAr: string | null;
  detailedSizeEn: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  isDefault: boolean;
  sku: string | null;
  showPrice: boolean;
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
  const currency = isAr ? "ر.س" : "SAR";

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

        return { ...v, price, finalPrice, hasDiscount, discountPercent };
      }),
    [variants]
  );

  if (variants.length <= 1) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-[10px] sm:text-xs text-neutral-400 uppercase tracking-widest">
        {isAr ? "المقاس واللون" : "Select Variant"}
      </h4>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
        {variantsWithDiscount.map((v) => {
          const isActive = v.id === activeVariantId;
          const isOutOfStock = v.stock === 0;

          // Build label
          const sizeName = isAr ? v.detailedSizeAr || v.sizeNameAr : v.detailedSizeEn || v.sizeNameEn;
          const colorName = isAr ? v.colorAr : v.colorEn;
          const label = [sizeName, colorName].filter(Boolean).join(" · ");

          return (
            <button
              key={v.id}
              onClick={() => !isOutOfStock && onVariantChange(v)}
              disabled={isOutOfStock}
              className={`relative flex flex-col items-center justify-center gap-1 px-4 py-4 rounded-xl border transition-all duration-300 group ${
                isActive
                  ? "border-[#e30613] bg-[#e30613]/5 shadow-sm z-10"
                  : isOutOfStock
                  ? "border-neutral-100 bg-neutral-50/50 opacity-40 cursor-not-allowed"
                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              {/* Variant Label */}
              <span
                className={`text-sm font-bold tracking-tight ${
                  isActive ? "text-[#e30613]" : "text-neutral-900"
                } ${isOutOfStock ? "line-through opacity-50" : ""}`}
              >
                {label || v.sku || `#${v.id.slice(0, 4)}`}
              </span>

              {/* Price on chip */}
              <div className="flex items-center gap-2">
                {v.showPrice ? (
                  <div className="flex flex-col items-center">
                    {v.hasDiscount && (
                       <span className="text-[10px] text-neutral-400 line-through leading-none mb-0.5">
                         {v.price.toLocaleString("en-US")}
                       </span>
                    )}
                    <span className={`text-[13px] font-black ${isActive ? "text-[#e30613]" : "text-neutral-700"}`}>
                      {v.finalPrice.toLocaleString("en-US")} <span className="text-[9px] opacity-70 uppercase tracking-tighter">{currency}</span>
                    </span>
                  </div>
                ) : (
                  <span className="text-[#e30613] text-[10px] font-bold px-2 py-0.5 bg-[#e30613]/10 rounded-lg border border-[#e30613]/20">
                    {isAr ? "استفسار" : "Inquiry"}
                  </span>
                )}
              </div>

              {/* Status Badges */}
              <div className="absolute -top-1.5 -end-1.5 flex gap-1">
                {v.hasDiscount && !isOutOfStock && (
                  <Badge className="h-5 text-[9px] bg-[#e30613] text-white px-1.5 rounded-full shadow-md shadow-[#e30613]/10 flex items-center justify-center border-none font-black">
                    -{v.discountPercent}%
                  </Badge>
                )}
                {v.stock > 0 && v.stock <= 3 && (
                  <Badge className="h-5 text-[9px] bg-neutral-900 text-white px-1.5 rounded-full shadow-md flex items-center justify-center border-none font-bold">
                    {v.stock} {isAr ? "فقط" : "left"}
                  </Badge>
                )}
              </div>

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px] rounded-xl pointer-events-none">
                   <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                      {isAr ? "نفذ" : "Sold"}
                   </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
