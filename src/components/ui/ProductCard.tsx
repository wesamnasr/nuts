import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/LocaleContext";
import { useCartStore } from "@/hooks/use-cart";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { toast } from "sonner";
import { Price } from "@/components/ui/Price";
import { cn } from "@/lib/utils";
import { calculateTimeLeft } from "@/lib/date-utils";

import { type StorefrontProduct as Product } from "@/lib/transformers";

interface ProductCardProps {
  product: Product;
  badge?: string;
  showFlashSale?: boolean;
  flashSaleEndDate?: Date;
}

export function ProductCard({ product, badge, showFlashSale, flashSaleEndDate }: ProductCardProps) {
  const { locale, t } = useLocale();
  const isAr = locale === "ar";
  const addItem = useCartStore((state) => state.addItem);
  const setOpen = useCartStore((state) => state.setOpen);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!showFlashSale || !flashSaleEndDate) return;

    const updateTimer = () => {
      const remaining = calculateTimeLeft(new Date(flashSaleEndDate), new Date());
      setTimeLeft(remaining);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [showFlashSale, flashSaleEndDate]);

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      variantId: product.variantId,
      name: isAr ? product.nameAr : product.nameEn,
      price: product.discountPrice || product.price,
      image: product.image,
      color: isAr ? (product.flavorAr || product.roastTypeAr || "") : (product.flavorEn || product.roastTypeEn || ""),
      size: isAr ? product.sizeAr : product.sizeEn,
      quantity: 1,
      slug: product.slug,
    });
    setOpen(true);

    toast.success(isAr ? "تمت الإضافة للسلة" : "Added to cart", {
      description: isAr ? product.nameAr : product.nameEn,
      position: "bottom-left"
    });
  };

  const getBadgeText = (text: string) => {
    if (text === "NEW") return isAr ? "جديد ✨" : "NEW ✨";
    if (text === "HOT") return isAr ? "الأكثر طلباً 🔥" : "HOT 🔥";
    return text;
  };

  return (
    <div
      className={cn(
        "group relative bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-neutral-100/80 hover:border-primary/20 shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 transition-all duration-500 h-full flex flex-col overflow-hidden transform-gpu",
        showFlashSale && "border-primary/30 ring-1 ring-primary/5"
      )}
      style={{ transform: "translateZ(0)" }}
    >
      {/* Badges */}
      <div className="absolute top-2 start-2 sm:top-4 sm:start-4 z-20 flex flex-col gap-1.5">
        {badge && (
          <span className="bg-primary text-white text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3.5 py-1 sm:py-1.5 uppercase tracking-widest w-fit rounded-full shadow-[0_4px_12px_rgba(var(--primary-rgb),0.3)]">
            {getBadgeText(badge)}
          </span>
        )}
        {product.discountPercent > 0 && (
          <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3.5 py-1 sm:py-1.5 uppercase tracking-widest w-fit rounded-full shadow-md">
            -{product.discountPercent}%
          </span>
        )}
      </div>

      <Link
        href={`/product/${product.slug}`}
        className="block relative aspect-square sm:aspect-[4/5] bg-neutral-50 overflow-hidden z-10"
      >
        <div className="relative w-full h-full">
          {/* Main Image */}
          <div className="relative w-full h-full group/img">
            <ImageWithFallback
              src={product.image}
              alt={product.altText || product.nameEn}
              fill
              className={cn(
                "object-cover transition-all duration-1000",
                (product.images?.length ?? 0) > 1 ? "group-hover/img:opacity-0 group-hover/img:scale-110" : "group-hover/img:scale-110"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
            />

            {/* Secondary Image on Hover */}
            {(product.images?.length ?? 0) > 1 && (
              <ImageWithFallback
                src={product.images![1].url}
                alt={product.images![1].altText || product.altText || product.nameEn}
                fill
                className="object-cover absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-all duration-1000 scale-110 group-hover/img:scale-100"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              />
            )}
          </div>

          {/* Flash Sale Countdown Overlay - Smaller on mobile */}
          {showFlashSale && timeLeft && (
            <div className="absolute top-2 end-2 sm:top-4 sm:end-4 z-20 scale-90 sm:scale-100 origin-top-right">
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-2 shadow-xl border border-primary/10 flex items-center gap-2">
                <Timer className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <div className="flex items-center gap-1 text-[9px] font-black text-neutral-900" dir="ltr">
                  <div className="flex flex-col items-center min-w-[16px]">
                    <span>{timeLeft.days.toString().padStart(2, '0')}</span>
                  </div>
                  <span className="opacity-30">:</span>
                  <div className="flex flex-col items-center min-w-[16px]">
                    <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
                  </div>
                  <span className="opacity-30">:</span>
                  <div className="flex flex-col items-center min-w-[16px]">
                    <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Overlay - Hidden on very small screens, visible on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-all duration-500 z-30 opacity-0 group-hover:opacity-100 hidden sm:block">
          <Button
            onClick={addToCart}
            className="w-full bg-neutral-900/90 backdrop-blur-md text-white hover:bg-primary shadow-2xl font-bold rounded-xl h-12 border border-white/10 transition-all group/btn"
          >
            <ShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            {t("addToCart")}
          </Button>
        </div>
      </Link>

      {/* Info */}
      <Link href={`/product/${product.slug}`} className="p-2.5 sm:p-5 flex flex-col flex-1 group-hover:bg-neutral-50/50 transition-colors">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          {product.sizeAr && (
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full font-cairo">
              {isAr ? product.sizeAr : product.sizeEn}
            </span>
          )}
          {product.roastTypeAr && (
            <span className="text-[10px] sm:text-[11px] text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full font-cairo">
              {isAr ? product.roastTypeAr : product.roastTypeEn}
            </span>
          )}
        </div>
        <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2 line-clamp-1 group-hover:text-primary transition-colors tracking-tight font-cairo">
          {isAr ? product.nameAr : product.nameEn}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          {product.showPrice ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
              <Price
                amount={product.discountPrice || product.price}
                className={cn("text-base sm:text-xl font-black", showFlashSale ? "text-red-600" : "text-neutral-900")}
                iconClassName="w-4 h-4 sm:w-5 sm:h-5"
              />
              {product.discountPrice && (
                <span className="text-[10px] sm:text-xs text-neutral-400 line-through decoration-red-500/30 font-medium">
                  {product.price.toLocaleString("en-US")}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
              {isAr ? "السعر عند الاستفسار" : "Price on Inquiry"}
            </span>
          )}

          {/* Mobile-only Cart Button */}
          <button
            onClick={addToCart}
            className="sm:hidden w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </Link>
    </div>
  );
}
