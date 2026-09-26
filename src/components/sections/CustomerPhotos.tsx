"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { Star, Camera } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CustomerPhoto {
  id: string;
  image: string;
  altText: string | null;
}

interface CustomerPhotosProps {
  photos: CustomerPhoto[];
}

export function CustomerPhotos({ photos }: CustomerPhotosProps) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";

  return (
    <section className="py-12 sm:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-20 gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neutral-900 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[10px] sm:text-sm font-black uppercase tracking-[0.3em] text-neutral-400">Social Gallery</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-neutral-900 leading-tight">
              {t("instagramTitle")}
            </h2>
            <p className="text-sm sm:text-lg text-neutral-500 font-medium leading-relaxed">
              {t("instagramDesc")}
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 px-6 py-3 bg-neutral-50 rounded-2xl border border-neutral-100">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold text-neutral-900">{isAr ? "مجتمع نيو كونسبت" : "New Concept Community"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {photos.length > 0 ? (
            photos.map((photo, index) => (
              <div
                key={photo.id}
                className={cn(
                  "relative aspect-square group overflow-hidden rounded-2xl sm:rounded-[2rem] bg-neutral-50 border border-neutral-100 shadow-sm",
                  index > 3 && "hidden lg:block",
                  index > 1 && "hidden sm:block lg:hide"
                )}
              >
                <Image
                  src={photo.image}
                  alt={photo.altText || "Customer Home"}
                  fill
                  className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 fill-white mb-2 transform scale-50 group-hover:scale-100 transition-transform duration-500" />
                  <span className="text-base sm:text-lg font-black tracking-widest">5.0</span>
                  <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">{isAr ? "تقييم العميل" : "CUSTOMER RATING"}</span>
                </div>
              </div>
            ))
          ) : (
            [1, 2, 3, 4].map((item) => (
              <div key={item} className="relative aspect-square group overflow-hidden rounded-[2.5rem] bg-neutral-100/50">
                <Image
                  src={`https://placehold.co/600x600/f5f5f5/a3a3a3.png?text=Gallery+${item}`}
                  alt="Customer Home"
                  fill
                  className="object-cover grayscale"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
