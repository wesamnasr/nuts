"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/i18n/LocaleContext";
import { motion } from "framer-motion";

import { LandingPageConfig } from "@/actions/landing";

export function Hero({ config }: { config?: LandingPageConfig }) {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";

  const title = isAr ? (config?.heroTitleAr || t("heroTitle")) : (config?.heroTitleEn || t("heroTitle"));
  const subtitle = isAr ? (config?.heroSubtitleAr || t("heroSubtitle")) : (config?.heroSubtitleEn || t("heroSubtitle"));
  const btnText = isAr ? (config?.heroButtonTextAr || t("heroShopBtn")) : (config?.heroButtonTextEn || t("heroShopBtn"));
  const link = config?.heroLink || "/shop";
  const image = config?.heroImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop";

  return (
    <section className="relative w-full h-[65vh] sm:h-[85vh] lg:h-[90vh] min-h-[400px] sm:min-h-[600px] overflow-hidden flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={image}
          alt="Luxury Furniture"
          fill
          className="object-cover transition-all duration-700 scale-105"
          priority
          quality={100}
        />
        {/* Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/30 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto">
        <div className="max-w-4xl space-y-5 sm:space-y-8 text-center sm:text-start mx-auto sm:mx-0">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[9px] sm:text-xs font-bold tracking-[0.2em] uppercase"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            {isAr ? "كوليكشن 2026 المميز" : "PREMIUM 2026 COLLECTION"}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.2] sm:leading-[1.1] drop-shadow-2xl"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-sm sm:text-xl md:text-2xl text-white/80 font-medium max-w-[280px] xs:max-w-md sm:max-w-2xl drop-shadow-md leading-relaxed mx-auto sm:mx-0"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-4 sm:pt-8"
          >
            <Link href={link} className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-5 bg-primary text-white font-bold text-base sm:text-lg rounded-full hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-2 group">
              {btnText}
              <div className="w-6 h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
            <Link href="/works" className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-5 bg-white/10 backdrop-blur-md text-white font-bold text-base sm:text-lg rounded-full hover:bg-white/20 hover:scale-105 active:scale-95 transition-all border border-white/20 flex items-center justify-center">
              {t("heroWorksBtn")}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 z-20 hidden sm:block"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}
