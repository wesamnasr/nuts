"use client";

import Link from "next/link";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { useLocale } from "@/i18n/LocaleContext";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type EmblaCarouselType } from "embla-carousel";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  image: string | null;
  _count: { products: number };
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: categories.length > 4,
    direction: isAr ? "rtl" : "ltr",
    dragFree: true
  }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
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

  if (!categories.length) return null;

  return (
    <section className="py-12 sm:py-20 lg:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-16 gap-4 sm:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-3 sm:space-y-4 max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              {isAr ? "اكتشف مجموعاتنا" : "DISCOVER OUR COLLECTIONS"}
            </div>
            <h2 className="text-xl sm:text-4xl lg:text-5xl font-black text-neutral-900 leading-tight">
              {isAr ? "تسوق حسب الفئة" : "Shop by Category"}
            </h2>
            <p className="text-neutral-500 text-[13px] sm:text-lg font-medium leading-relaxed">
              {isAr
                ? "استكشف مجموعاتنا المختارة بعناية لتناسب ذوقك الرفيع وتضفي لمسة من الفخامة."
                : "Explore our carefully curated collections to suit your refined taste and luxury."}
            </p>
          </motion.div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={scrollPrev}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all shadow-sm active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className={cn("w-4 h-4 sm:w-5 sm:h-5", isAr && "rotate-180")} />
            </button>
            <button
              onClick={scrollNext}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all shadow-sm active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className={cn("w-4 h-4 sm:w-5 h-5", isAr && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4 sm:-ml-6 touch-pan-y">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex-[0_0_70%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] xl:flex-[0_0_25%] pl-4 sm:pl-6"
                >
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="group relative block aspect-square sm:h-[450px] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-neutral-100 transition-all duration-700 hover:shadow-2xl hover:shadow-black/10 border border-neutral-200/50 transform-gpu"
                    style={{ transform: "translateZ(0)" }}
                  >
                    {/* Image */}
                    <div className="absolute inset-0 z-0">
                      <ImageWithFallback
                        src={category.image || "https://placehold.co/800x600?text=No+Image"}
                        alt={isAr ? category.nameAr : category.nameEn}
                        fill
                        className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 400px"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-neutral-900/90 via-transparent to-transparent opacity-80" />
                    </div>

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-8">
                      <div className="space-y-1.5 sm:space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-white/60 text-[9px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                          {category._count.products} {isAr ? "منتج" : "Products"}
                        </p>
                        <h3 className="text-lg sm:text-3xl font-black text-white tracking-tight">
                          {isAr ? category.nameAr : category.nameEn}
                        </h3>
                      </div>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center opacity-0 -translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
                      <ChevronRight className={cn("w-5 h-5 sm:w-6 sm:h-6 text-neutral-900", isAr && "rotate-180")} />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 sm:mt-16 flex items-center justify-center">
          <div className="h-1 sm:h-1 bg-neutral-100 rounded-full overflow-hidden w-full max-w-[200px] sm:max-w-[240px]">
            <motion.div
              className="h-full bg-primary"
              animate={{ width: `${scrollProgress}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
