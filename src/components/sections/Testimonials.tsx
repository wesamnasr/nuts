"use client";

import { useState, useCallback } from "react";
import { useLocale } from "@/i18n/LocaleContext";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ReviewModal } from "@/components/reviews/ReviewModal";


interface Testimonial {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  textAr: string;
  textEn: string;
  image: string | null;
  rating: number;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const { locale, t, dir } = useLocale();
  const isAr = locale === "ar";
  const [showForm, setShowForm] = useState(false);
  const isRtl = dir === "rtl";

  const useCarousel = testimonials.length > 3;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    containScroll: "trimSnaps",
    direction: isRtl ? "rtl" : "ltr",
    active: useCarousel
  }, [
    Autoplay({ delay: 4000, stopOnInteraction: true })
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-neutral-50/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-10 sm:mb-24 gap-6 sm:gap-8">
          <div className="text-center sm:text-start space-y-3 sm:space-y-4 max-w-2xl">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="px-3 py-1 sm:px-4 sm:py-1.5 bg-primary/10 text-primary rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
                {isAr ? "آراء العملاء" : "Testimonials"}
              </div>
            </div>
            <h2 className="text-2xl sm:text-5xl lg:text-6xl font-black text-neutral-900 leading-tight">
              {t("testimonials")}
            </h2>
            <p className="text-neutral-500 text-base sm:text-xl font-medium max-w-xl">
              {t("testimonialsDesc")}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={scrollPrev}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border border-neutral-100 flex items-center justify-center hover:bg-neutral-900 hover:text-white transition-all bg-white shadow-xl shadow-neutral-200/50"
              aria-label="Previous slide"
            >
              <ChevronLeft className={`w-5 h-5 sm:w-6 sm:h-6 ${isRtl ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={scrollNext}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border border-neutral-100 flex items-center justify-center hover:bg-neutral-900 hover:text-white transition-all bg-white shadow-xl shadow-neutral-200/50"
              aria-label="Next slide"
            >
              <ChevronRight className={`w-5 h-5 sm:w-6 sm:h-6 ${isRtl ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <div
            className="overflow-hidden"
            ref={emblaRef}
          >
            <div className="flex -ml-4 sm:-ml-8 touch-pan-y">
              {testimonials.length > 0 ? (
                testimonials.map((review) => (
                  <div
                    key={review.id}
                    className="flex-[0_0_100%] min-w-0 pl-4 sm:pl-8 sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] pb-6"
                  >
                    <div className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl sm:rounded-[3rem] border border-neutral-100 relative hover:shadow-2xl transition-all duration-500 h-full group">
                      <div className="absolute top-4 right-4 sm:top-10 sm:right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Quote className="w-8 h-8 sm:w-16 sm:h-16" />
                      </div>

                      <div className="flex gap-1 mb-4 sm:mb-8">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-primary text-primary" />
                        ))}
                      </div>

                      <p className="text-neutral-600 text-sm sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-10 font-medium italic relative z-10 transition-all">
                        &ldquo;{isAr ? review.textAr : review.textEn}&rdquo;
                      </p>

                      <div className="flex items-center gap-3 sm:gap-5 pt-4 sm:pt-8 border-t border-neutral-50">
                        <div className="relative w-10 h-10 sm:w-16 sm:h-16 rounded-lg sm:rounded-2xl overflow-hidden bg-neutral-100 shadow-md">
                          <Image
                            src={review.image || `https://placehold.co/100x100?text=${(review.nameEn || "U").charAt(0)}`}
                            alt={isAr ? review.nameAr : review.nameEn}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-black text-neutral-900 text-sm sm:text-lg leading-tight">
                            {isAr ? review.nameAr : review.nameEn}
                          </h4>
                          <p className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                            {isAr ? review.roleAr : review.roleEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))) : (
                <div className="w-full text-center py-20 text-neutral-400">
                  <p className="text-2xl font-black">{isAr ? "لا توجد آراء حاليا" : "No testimonials yet"}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button & Modal */}
        <div className="mt-12 sm:mt-32 text-center">
          <Button
            onClick={() => setShowForm(true)}
            className="h-14 sm:h-16 px-8 sm:px-10 rounded-xl sm:rounded-2xl gap-2 sm:gap-3 text-base sm:text-lg font-black bg-neutral-900 text-white hover:bg-black transition-all shadow-xl shadow-neutral-900/10"
          >
            <Quote className="w-4 h-4 sm:w-5 sm:h-5" />
            {isAr ? "شاركنا رأيك" : "Share Your Experience"}
          </Button>

          <ReviewModal
            isOpen={showForm}
            onOpenChange={setShowForm}
          />
        </div>
      </div>
    </section>
  );
}
