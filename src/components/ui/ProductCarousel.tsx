"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { type EmblaCarouselType } from "embla-carousel";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/LocaleContext";
import { ProductCard } from "@/components/ui/ProductCard";
import { type StorefrontProduct as Product } from "@/lib/transformers";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type ProductCarouselProps = {
  products: Product[];
  title?: string;
  description?: string;
  viewAllLink?: string;
  badge?: string;
};

export function ProductCarousel({
  products,
  title,
  description,
  viewAllLink,
  badge,
}: ProductCarouselProps) {
  const { locale, t } = useLocale();
  const isAr = locale === "ar";
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: products.length > 1,
    direction: isAr ? "rtl" : "ltr"
  }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);
  const [scrollProgress, setScrollProgress] = useState(0);

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()));
    setScrollProgress(progress * 100);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll(emblaApi);
    emblaApi.on("reInit", onScroll);
    emblaApi.on("scroll", onScroll);
  }, [emblaApi, onScroll]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!products.length) return null;

  return (
    <section className="py-20 lg:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center sm:items-end mb-12 sm:mb-16 gap-8 text-center sm:text-start">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 rounded-full text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              {isAr ? "تسوق المجموعات" : "SHOP COLLECTIONS"}
            </div>
            {title && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-neutral-500 text-base sm:text-lg font-medium leading-relaxed">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollPrev}
              className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all shadow-sm active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className={cn("w-5 h-5", isAr && "rotate-180")} />
            </button>
            <button
              onClick={scrollNext}
              className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all shadow-sm active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className={cn("w-5 h-5", isAr && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-4 sm:-ml-6 touch-pan-y">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] xl:flex-[0_0_25%] pl-4 sm:pl-6 pb-4"
              >
                <ProductCard product={product} badge={badge} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions & Progress */}
        <div className="mt-16 flex flex-col items-center gap-8">
          <div className="h-1 bg-neutral-100 rounded-full overflow-hidden w-full max-w-[240px]">
            <motion.div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {viewAllLink && (
            <Link href={viewAllLink} className="group flex items-center gap-3 py-3 px-8 bg-neutral-900 text-white font-bold rounded-2xl hover:bg-primary transition-all shadow-2xl active:scale-95">
              {t("viewAll")}
              <ChevronRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", isAr && "rotate-180 group-hover:-translate-x-1")} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
