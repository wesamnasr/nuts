"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { ProductCard } from "@/components/ui/ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { calculateTimeLeft } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

import { type StorefrontProduct as FeaturedProduct } from "@/lib/transformers";

export interface FlashSalesProps {
  products: FeaturedProduct[];
  endDate?: Date | null;
  discount: number;
  serverTime: Date;
}

export function FlashSales({ products, endDate, discount, serverTime }: FlashSalesProps) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
   const [isPaused, setIsPaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    const scrollInterval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 3000);
    return () => clearInterval(scrollInterval);
  }, [isPaused]);

  // Calculate time difference based on server time initially to match SSR
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(() => endDate ? calculateTimeLeft(new Date(endDate), new Date(serverTime)) : null);

  useEffect(() => {
    if (!endDate) return;

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft(new Date(endDate), new Date()));
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!endDate) return null;

  return (
    <section className="py-12 sm:py-20 bg-neutral-900 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header & Countdown */}
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between mb-8 sm:mb-16 gap-6 sm:gap-8 text-center lg:text-start">
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full text-white text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              {isAr ? "عرض محدود لفترة وجيزة" : "STRICTLY LIMITED OFFER"}
            </div>
            <div>
              <h3 className="text-xl sm:text-5xl font-black text-white mb-2 sm:mb-3 tracking-tight">{t("flashTitle")}</h3>
              <p className="text-neutral-400 text-xs sm:text-lg font-medium">{t("flashSubtitle")}</p>
            </div>
          </div>

          {timeLeft && (
            <div className="flex items-center gap-2 sm:gap-6 bg-white/5 backdrop-blur-xl p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-white/10 shadow-2xl" dir="ltr" suppressHydrationWarning>
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="text-lg sm:text-4xl font-black text-white px-1 sm:px-2">
                  {timeLeft.days.toString().padStart(2, '0')}
                </div>
                <span className="text-[7px] sm:text-[10px] font-bold text-primary uppercase tracking-widest sm:tracking-[0.2em]">Days</span>
              </div>
              <div className="text-lg sm:text-2xl text-white/20 font-light mb-4 sm:mb-6">:</div>
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="text-lg sm:text-4xl font-black text-white px-1 sm:px-2" suppressHydrationWarning>
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <span className="text-[7px] sm:text-[10px] font-bold text-primary uppercase tracking-widest sm:tracking-[0.2em]">Hrs</span>
              </div>
              <div className="text-lg sm:text-2xl text-white/20 font-light mb-4 sm:mb-6">:</div>
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <div className="text-lg sm:text-4xl font-black text-white px-1 sm:px-2" suppressHydrationWarning>
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <span className="text-[7px] sm:text-[10px] font-bold text-primary uppercase tracking-widest sm:tracking-[0.2em]">Min</span>
              </div>
            </div>
          )}

          {/* Navigation Buttons - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-14 h-14 rounded-full border border-white/10 bg-white/5 text-white flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl active:scale-90"
              aria-label="Previous slide"
            >
              <ChevronLeft className={cn("w-6 h-6", isAr && "rotate-180")} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-14 h-14 rounded-full border border-white/10 bg-white/5 text-white flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl active:scale-90"
              aria-label="Next slide"
            >
              <ChevronRight className={cn("w-6 h-6", isAr && "rotate-180")} />
            </button>
          </div>
        </div>


        {/* Product List */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex -ml-4 sm:-ml-6 overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar pb-8 pt-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {products.map((product) => {
            const originalPrice = Number(product.price);
            const discountedPrice = originalPrice * (1 - discount / 100);

            return (
              <div
                key={product.id}
                className="flex-[0_0_70%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] xl:flex-[0_0_22%] min-w-0 pl-4 sm:pl-6 snap-start"
              >
                <ProductCard
                  product={{
                    ...product,
                    price: originalPrice,
                    discountPrice: discountedPrice,
                  }}
                  badge={`${discount}% ${t("discountOff")}`}
                  showFlashSale
                  flashSaleEndDate={endDate}
                />

                {/* Quantity Sold Progress Bar */}
                <div className="mt-6 px-4">
                  <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-neutral-500">{t("sales")}</span>
                    <span className="text-red-500 animate-pulse">{t("limitedOffer")}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                    <div
                      className="h-full bg-linear-to-r from-red-600 to-primary rounded-full"
                      style={{ width: `${Math.floor((product.id.charCodeAt(0) % 40) + 40)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll Progress Bar */}
        <div className="mt-4 flex items-center justify-center">
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden w-full max-w-[100px] sm:max-w-[140px]">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

