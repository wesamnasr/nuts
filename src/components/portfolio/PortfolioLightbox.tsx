"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import { type PortfolioItem } from "@prisma/client";
import { useLocale } from "@/i18n/LocaleContext";

interface PortfolioLightboxProps {
  initialIndex: number;
  items: PortfolioItem[];
  onClose: () => void;
  accentColor: string;
  categoryName?: string;
}

export function PortfolioLightbox({
  initialIndex,
  items,
  onClose,
  accentColor,
  categoryName,
}: PortfolioLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const { locale } = useLocale();

  // Reset current index when initialIndex changes or lightbox opens
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const currentItem = items[currentIndex];

  const paginate = useCallback((newDirection: number) => {
    const nextIndex = (currentIndex + newDirection + items.length) % items.length;
    setDirection(newDirection);
    setCurrentIndex(nextIndex);
  }, [currentIndex, items.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") paginate(-1);
    if (e.key === "ArrowRight") paginate(1);
  }, [onClose, paginate]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [handleKeyDown]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  const whatsappMessage = 
    currentItem.whatsappMessage || 
    (locale === "ar" 
      ? `السلام عليكم ورحمة الله وبركاته،\n\nأود الاستفسار وطلب تسعيرة بخصوص التصميم الآتي من معرض أعمالكم:\n\n*العمل المطلوب:* ${currentItem.titleAr || "صورة من معرض الأعمال"}\n\nيرجى تزويدي بالتفاصيل المتاحة وإمكانية التنفيذ.\n\nشكراً لكم.` 
      : `Dear Customer Service,\n\nI would like to request a quotation and further details regarding the following design from your portfolio:\n\n*Project:* ${currentItem.titleEn || "Portfolio Item"}\n\nPlease provide me with the available details and execution possibilities.\n\nThank you.`);

  const whatsappLink = `https://wa.me/966500000000?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Navigation */}
      <button
        className="absolute left-4 z-50 p-3 text-white/50 hover:text-white transition-colors hover:scale-110 hidden md:block"
        onClick={() => paginate(-1)}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        className="absolute right-4 z-50 p-3 text-white/50 hover:text-white transition-colors hover:scale-110 hidden md:block"
        onClick={() => paginate(1)}
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Content */}
      <div className="relative w-full h-full max-w-5xl max-h-screen p-4 flex flex-col items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2} // Reduced elasticity for a more stable feel
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x * (Math.abs(velocity.x) > 500 ? 2 : 1); // Boost swipe power if fast

              if (swipe < -100) { // Threshold for left swipe (next)
                paginate(1);
              } else if (swipe > 100) { // Threshold for right swipe (prev)
                paginate(-1);
              }
            }}
            className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center"
          >
            {currentItem.mediaType === "VIDEO" ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center rounded-xl overflow-hidden shadow-2xl border border-white/10">
                     <video 
                        controls 
                        autoPlay 
                        className="w-full h-full object-contain"
                        src={currentItem.mediaUrl}
                     />
                </div>
            ) : (
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/10">
                     <Image
                        src={currentItem.mediaUrl}
                        alt={currentItem.titleEn || "Portfolio"}
                        fill
                        className="object-contain"
                        priority
                     />
                </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Caption & Actions */}
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-6 md:bottom-10 left-0 right-0 max-w-2xl mx-auto flex flex-col items-center gap-6 text-center pointer-events-auto"
        >
            <div className="bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4 w-full">
                 <div className="space-y-2">
                    {categoryName && (
                        <span 
                            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/10"
                            style={{ color: accentColor }}
                        >
                            {categoryName}
                        </span>
                    )}
                    <h2 
                        className="text-white text-xl md:text-3xl font-bold drop-shadow-lg font-sans"
                    >
                        {locale === "ar" ? currentItem.titleAr : currentItem.titleEn}
                    </h2>
                     {(currentItem.descriptionAr || currentItem.descriptionEn) && (
                        <p className="text-neutral-300 text-sm md:text-base leading-relaxed max-w-prose mx-auto">
                            {locale === "ar" ? currentItem.descriptionAr : currentItem.descriptionEn}
                        </p>
                    )}
                 </div>

                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full font-bold shadow-lg hover:shadow-[#25D366]/50 transition-all duration-300 transform hover:-translate-y-1 group"
                >
                    <MessageCircle className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" />
                    <span>
                        {locale === "ar" ? "طلب سعر لهذا التصميم" : "Request Price for Design"}
                    </span>
                </a>
            </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
