"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PortfolioItem as PortfolioItemComponent } from "./PortfolioItem";
import { PortfolioLightbox } from "./PortfolioLightbox";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { type PortfolioItem } from "@prisma/client";
import { useLocale } from "@/i18n/LocaleContext";

interface PortfolioGridProps {
  items: PortfolioItem[];
  accentColor?: string;
  categoryName?: string;
}

export function PortfolioGrid({ items, accentColor = "#D4AF37", categoryName }: PortfolioGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const { locale } = useLocale();
  const isRtl = locale === "ar";

  const gridRowsClass = items.length <= 4 ? "grid-rows-1" : "sm:grid-rows-2 grid-rows-1";
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Auto-scroll logic
  useEffect(() => {
    if (isHovering || items.length < (isRtl ? 1 : 2)) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const reachedEnd = isRtl 
          ? Math.abs(scrollLeft) >= scrollWidth - clientWidth - 50
          : scrollLeft >= scrollWidth - clientWidth - 50;
          
        if (reachedEnd) {
           scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
           // Scroll by a smaller amount on mobile for precision
           const amount = window.innerWidth < 640 ? clientWidth * 0.7 : clientWidth * 0.8;
           scrollRef.current.scrollBy({ left: isRtl ? -amount : amount, behavior: "smooth" });
        }
      }
    }, 6000); // Slower interval for less intrusive auto-scroll

    return () => clearInterval(interval);
  }, [isHovering, items.length, isRtl]);

  const handleScroll = (direction: "next" | "prev") => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    
    const scrollAmount = direction === "next" 
      ? (isRtl ? -clientWidth : clientWidth)
      : (isRtl ? clientWidth : -clientWidth);
      
    scrollRef.current.scrollBy({ left: scrollAmount * 0.8, behavior: "smooth" });
    setShowSwipeHint(false);
  };

  return (
    <>
      <div 
        className="relative group/grid"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={() => {
            setIsHovering(true);
            setShowSwipeHint(false);
        }}
        onTouchEnd={() => {
            setTimeout(() => setIsHovering(false), 2000);
        }}
      >
        {/* Navigation Buttons */}
        {items.length > 2 && (
          <>
            <button
              onClick={() => handleScroll("prev")}
              className={`absolute top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-black/80 p-2 md:p-3 rounded-full shadow-lg text-neutral-900 border border-neutral-200 dark:border-white/10 dark:text-white hover:bg-white hover:scale-110 transition-all opacity-0 md:group-hover/grid:opacity-100 disabled:opacity-0 hidden md:flex
                ${isRtl ? "right-2 md:right-4" : "left-2 md:left-4"}
              `}
              aria-label="Previous"
            >
              {isRtl ? <ChevronRight className="w-5 h-5 md:w-6 md:h-6" /> : <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            <button
              onClick={() => handleScroll("next")}
              className={`absolute top-1/2 -translate-y-1/2 z-20 bg-white/90 dark:bg-black/80 p-2 md:p-3 rounded-full shadow-lg text-neutral-900 border border-neutral-200 dark:border-white/10 dark:text-white hover:bg-white hover:scale-110 transition-all opacity-0 md:group-hover/grid:opacity-100 disabled:opacity-0 hidden md:flex
                ${isRtl ? "left-2 md:left-4" : "right-2 md:right-4"}
              `}
              aria-label="Next"
            >
              {isRtl ? <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" /> : <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </>
        )}

        {/* Mobile Swipe Hint */}
        {showSwipeHint && items.length > 1 && (
            <div className="absolute inset-0 z-30 pointer-events-none md:hidden flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px]">
                <motion.div 
                    initial={{ x: isRtl ? 20 : -20, opacity: 0 }}
                    animate={{ x: isRtl ? -20 : 20, opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-2xl">
                        <ChevronRight className={cn("w-8 h-8 text-white", isRtl ? "rotate-180" : "")} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white drop-shadow-lg">
                        {locale === "ar" ? "اسحب للاستعراض" : "Swipe to explore"}
                    </span>
                </motion.div>
            </div>
        )}

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto pb-4 md:pb-6 snap-x scrollbar-hide scroll-smooth no-scrollbar"
        >
          <div className={cn(
            "grid grid-flow-col gap-4 min-w-max pr-12",
            gridRowsClass
          )}>
            <AnimatePresence>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="snap-center shrink-0"
                >
                  <PortfolioItemComponent 
                    item={{
                      id: item.id,
                      mediaUrl: item.mediaUrl,
                      mediaType: item.mediaType,
                      titleAr: item.titleAr,
                      titleEn: item.titleEn,
                      descriptionAr: item.descriptionAr,
                      descriptionEn: item.descriptionEn,
                      whatsappMessage: item.whatsappMessage
                    }}
                    accentColor={accentColor}
                    onClick={() => setLightboxIndex(index)}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== -1 && (
          <PortfolioLightbox
            initialIndex={lightboxIndex}
            items={items}
            onClose={() => setLightboxIndex(-1)}
            accentColor={accentColor}
            categoryName={categoryName}
          />
        )}
      </AnimatePresence>
    </>
  );
}
