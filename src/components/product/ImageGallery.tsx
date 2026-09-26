"use client";

import { useState, useCallback, useRef, TouchEvent, useEffect } from "react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";

type ProductImage = {
  id: string;
  url: string;
  publicId?: string | null;
  altText: string | null;
  isMain: boolean;
};

// Custom Lightbox Component
function Lightbox({ 
  images, 
  activeIndex, 
  onClose, 
  onNavigate 
}: { 
  images: ProductImage[], 
  activeIndex: number, 
  onClose: () => void, 
  onNavigate: (index: number) => void 
}) {

  const activeImage = images[activeIndex];
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((activeIndex + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((activeIndex - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length, onClose, onNavigate]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 z-[110]"
      >
        <span className="sr-only">Close</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
        <ImageWithFallback
          src={activeImage?.url || ""}
          alt={activeImage?.altText || "Zoomed image"}
          width={1600}
          height={1200}
          className="max-w-full max-h-full object-contain shadow-2xl"
        />
      </div>

      {/* Nav Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate((activeIndex - 1 + images.length) % images.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate((activeIndex + 1) % images.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-4"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </>
      )}

      {/* Counter */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 font-mono text-sm tracking-widest">
        {activeIndex + 1} / {images.length}
      </div>
    </div>
  );
}

export function ImageGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const touchStartX = useRef(0);
  const { locale } = useLocale();

  const activeImage = images[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (index === activeIndex || isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex(index);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 150);
    },
    [activeIndex, isTransitioning]
  );

  const next = () => goTo((activeIndex + 1) % images.length);
  const prev = () => goTo((activeIndex - 1 + images.length) % images.length);

  // Touch/Swipe handlers for mobile
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      // Respect RTL direction
      if (locale === "ar") {
        if (diff > 0) prev();
        else next();
      } else {
        if (diff > 0) next();
        else prev();
      }
    }
  };

  // Desktop hover zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  if (!images.length) {
    return (
      <div className="aspect-4/3 rounded-xl bg-neutral/30 flex items-center justify-center text-secondary">
        {locale === "ar" ? "لا توجد صور" : "No images available"}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative group/gallery">
        {/* Subtle Golden Aura Glow */}
        <div className="absolute -inset-4 bg-primary/5 blur-3xl rounded-[4rem] opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-1000" />
        
        <div
          className="relative aspect-square md:aspect-4/3 w-full -mx-4 md:mx-0 md:rounded-[2.5rem] overflow-hidden bg-white group cursor-zoom-in rounded-b-[3rem] md:rounded-b-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] border border-neutral-100/50"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMove}
          onClick={() => setIsLightboxOpen(true)}
        >
        {/* Normal Image */}
        <div className="relative w-full h-full">
          <ImageWithFallback
            src={activeImage?.url || "https://placehold.co/800x600?text=No+Image"}
            alt={activeImage?.altText || "Product image"}
            fill
            className={`object-cover w-full h-full transition-opacity duration-300 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            } md:group-hover:opacity-0`}
            priority={activeIndex < 2}
          />
        </div>

        {/* Zoomed Image (Desktop hover only) */}
        <div
          className="absolute inset-0 hidden md:group-hover:block transition-all duration-300"
          style={{
            backgroundImage: `url(${activeImage?.url})`, 
            backgroundSize: "200%",
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Desktop Zoom Icon */}
        <div className="hidden md:block absolute top-4 end-4 bg-white/90 text-neutral-900 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg pointer-events-none transform translate-y-2 group-hover:translate-y-0">
          <ZoomIn className="w-5 h-5" />
        </div>

        {/* Mobile Navigation Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
            {images.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex 
                    ? "bg-primary w-6" 
                    : "bg-black/20 backdrop-blur-sm"
                }`}
              />
            ))}
          </div>
        )}

        {/* Desktop Nav Arrows (Glassy) */}
        {images.length > 1 && (
          <div className="hidden md:block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute start-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-neutral-900 p-4 rounded-2xl shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 border border-white/30"
              aria-label="Previous"
            >
              {locale === "ar" ? (
                <ChevronRight className="w-6 h-6" />
              ) : (
                <ChevronLeft className="w-6 h-6" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute end-6 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-neutral-900 p-4 rounded-2xl shadow-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 border border-white/30"
              aria-label="Next"
            >
              {locale === "ar" ? (
                <ChevronLeft className="w-6 h-6" />
              ) : (
                <ChevronRight className="w-6 h-6" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>

      {/* Desktop Thumbnails (Refined) */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-4 overflow-x-auto py-4 scrollbar-hide snap-x px-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => goTo(idx)}
              className={`relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300 snap-start ${
                idx === activeIndex
                  ? "border-primary shadow-xl ring-4 ring-primary/10 scale-105 z-10"
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-neutral-200"
              }`}
            >
              <ImageWithFallback
                src={img.url}
                alt={img.altText || `Thumbnail ${idx + 1}`}
                fill
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Overlay */}
      {isLightboxOpen && (
        <Lightbox 
          images={images} 
          activeIndex={activeIndex} 
          onClose={() => setIsLightboxOpen(false)}
          onNavigate={goTo}
        />
      )}
    </div>
  );
}
