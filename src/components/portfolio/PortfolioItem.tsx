import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, MessageCircle, Play } from "lucide-react";
import { useLocale } from "@/i18n/LocaleContext";
import { MediaType } from "@prisma/client";
import React from "react";
interface PortfolioItemProps {
  item: {
    id: string;
    mediaUrl: string;
    mediaType: MediaType;
    titleAr: string | null;
    titleEn: string | null;
    descriptionAr: string | null;
    descriptionEn: string | null;
    whatsappMessage: string | null;
  };
  onClick: () => void;
  accentColor: string;
}

export function PortfolioItem({ item, onClick, accentColor }: PortfolioItemProps) {
  const { locale } = useLocale();

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = item.whatsappMessage || 
      (locale === "ar" 
        ? `مرحباً، أنا مهتم بتفاصيل هذا التصميم: ${item.titleAr || "تصميم مميز"}`
        : `Hello, I am interested in this design: ${item.titleEn || "Featured Design"}`
      );
    const url = `https://wa.me/966500000000?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-[240px] sm:w-[280px] md:w-[320px] snap-center shrink-0 group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
        onClick={onClick}
        style={{"--accent": accentColor} as React.CSSProperties}
    >
      <div className="relative aspect-square sm:aspect-4/5 overflow-hidden bg-neutral-100 transition-transform duration-700 group-hover:scale-[1.02]">
         {item.mediaType === "VIDEO" ? (
             <>
                <video
                    src={item.mediaUrl}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    muted
                    playsInline
                    loop
                />
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-500">
                     <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/40 shadow-2xl">
                        <Play className="w-8 h-8 fill-white/80" />
                     </div>
                 </div>
             </>
         ) : (
            <div className="relative w-full h-full transition-transform duration-1000 group-hover:scale-110">
                <Image
                    src={item.mediaUrl}
                    alt={(locale === "ar" ? item.titleAr : item.titleEn) || "Portfolio Image"}
                    fill
                    sizes="(max-width: 768px) 280px, 320px"
                    className="object-cover"
                />
            </div>
         )}

         {/* Gradient Overlay (Enhanced Contrast) */}
         <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
            
            {/* Content (Elegant Slide Up) */}
            <div className="translate-y-6 group-hover:translate-y-0 transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)">
                <div className="space-y-0.5 mb-4">
                    <span className="text-[8px] font-black tracking-[0.2em] text-white/50 uppercase">
                        {locale === "ar" ? "تفاصيل المشروع" : "Project Details"}
                    </span>
                    <h3 className="text-white font-black text-lg sm:text-xl lg:text-2xl leading-tight">
                        {locale === "ar" ? item.titleAr : item.titleEn}
                    </h3>
                    {(item.descriptionAr || item.descriptionEn) && (
                        <p className="text-white/70 text-xs line-clamp-2 font-light leading-relaxed pt-1">
                            {locale === "ar" ? item.descriptionAr : item.descriptionEn}
                        </p>
                    )}
                </div>
                
                {/* Actions (Floating Glass) */}
                <div className="flex gap-3">
                   <button 
                        className="flex-1 bg-white/10 backdrop-blur-xl hover:bg-white text-white hover:text-neutral-900 py-2 rounded-xl transition-all duration-500 flex items-center justify-center gap-2 group/view border border-white/10 hover:border-white shadow-lg"
                   >
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {locale === "ar" ? "تصفح" : "Explore"}
                      </span>
                      <Eye className="w-3.5 h-3.5 transition-transform group-hover/view:scale-110" />
                   </button>
                   
                   <button 
                        onClick={handleWhatsApp}
                        className="w-10 h-10 bg-emerald-500/80 backdrop-blur-xl hover:bg-emerald-500 text-white rounded-xl transition-all duration-500 flex items-center justify-center shadow-lg hover:shadow-emerald-500/20 border border-emerald-400/20 group/wa"
                        title={locale === "ar" ? "اطلب عبر واتساب" : "Order via WhatsApp"}
                   >
                      <MessageCircle className="w-5 h-5 transition-transform group-hover/wa:rotate-12" />
                   </button>
                </div>
            </div>
         </div>
         
         {/* Video/New Indicator */}
         {item.mediaType === "VIDEO" && (
            <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-xl text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-white/20 uppercase">
                Interactive
            </div>
         )}

         {/* Selection Glow */}
         <div className="absolute -inset-10 bg-(--accent)/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
      </div>

       {/* Accent Border on Hover */}
       <div className="absolute inset-0 border-2 border-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
    </motion.div>
  );
}
