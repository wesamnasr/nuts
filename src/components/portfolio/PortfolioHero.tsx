"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/i18n/LocaleContext";

interface PortfolioHeroProps {
  heroTitleAr?: string | null;
  heroTitleEn?: string | null;
  heroDescAr?: string | null;
  heroDescEn?: string | null;
}

export function PortfolioHero({ heroTitleAr, heroTitleEn, heroDescAr, heroDescEn }: PortfolioHeroProps) {
  const { locale } = useLocale();
  const isAr = locale === "ar";
  
  // Defaults if no data provided
  const titleAr = heroTitleAr || "حلول مبتكرة للتصميم الداخلي والتشطيبات المعمارية في السعودية";
  const titleEn = heroTitleEn || "Innovative Solutions for Interior Design & Architectural Finishes";
  const descAr = heroDescAr || "إذا كنت تبحث عن تصميمات مبتكرة تشع بالجمال والذوق الرفيع، فأنت في المكان الصحيح. في شركة مفهوم جديد للديكور، نقدم لك حلولًا معمارية فاخرة تشبع تطلعاتك وتناسب كل ذوق. سواء كنت بحاجة لتصميم داخلي لبيتك أو مكتبك، أو كنت تبحث عن تشطيبات معمارية مميزة، نحن هنا لنحول أفكارك إلى واقع ملموس بكل دقة واهتمام بالتفاصيل.";
  const descEn = heroDescEn || "If you are looking for innovative designs that radiate beauty and high taste, you are in the right place. At New Concept Decor, we offer luxurious architectural solutions that satisfy your aspirations and suit every taste. Whether you need interior design for your home or office, or are looking for distinctive architectural finishes, we are here to turn your ideas into tangible reality with precision and attention to detail.";

  return (
    <section className="relative pt-24 sm:pt-32 pb-8 sm:pb-16 overflow-hidden">
      {/* Immersive Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-primary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="w-[90%] max-w-[2000px] mx-auto px-4 relative">
        {/* Decorative Badge */}
        <div className="flex justify-center mb-6 sm:mb-8">
            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] animate-in fade-in zoom-in duration-1000">
                {isAr ? "معرض التميز" : "Gallery of Excellence"}
            </div>
        </div>
      <motion.div 
        key={locale} // Re-animate on locale change
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl mx-auto space-y-8 sm:space-y-12"
      >
        {isAr ? (
           // Arabic Content
           <div className="space-y-3 sm:space-y-6 flex flex-col items-center text-center" dir="rtl">
               <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-neutral-900 leading-tight max-w-4xl tracking-tight">
                {titleAr}
               </h1>
               <div className="w-10 sm:w-16 h-1 bg-primary/30 rounded-full my-1.5 sm:my-3" />
               <p className="text-sm sm:text-xl text-neutral-500 leading-relaxed max-w-2xl mx-auto font-light">
                 {descAr}
               </p>
            </div>
        ) : (
           // English Content
            <div className="space-y-3 sm:space-y-6 text-center flex flex-col items-center">
               <h1 className="text-2xl sm:text-6xl lg:text-7xl font-black text-neutral-900 tracking-tight leading-tight">
                 {titleEn}
               </h1>
               <div className="w-10 sm:w-16 h-1 bg-primary/30 rounded-full my-1.5 sm:my-3" />
               <p className="text-sm sm:text-xl text-neutral-400 font-light max-w-2xl mx-auto leading-relaxed">
                 {descEn}
               </p>
            </div>
        )}
      </motion.div>
      </div>
    </section>
  );
}
