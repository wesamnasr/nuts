"use client";

import { useLocale } from "@/i18n/LocaleContext";
import { motion } from "framer-motion";
import { Percent, Sparkles } from "lucide-react";

export function SalesHero() {
  const { t, dir } = useLocale();
  const isRtl = dir === "rtl";

  return (
    <section className="relative overflow-hidden bg-neutral-900 py-24 sm:py-32">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] opacity-50 animate-pulse" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[100px] opacity-30" />
      </div>

      <div className="container relative mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-primary-foreground border border-white/10 mb-8"
        >
          <Percent className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold tracking-wider uppercase drop-shadow-sm">
            {t("limitedOffer")}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight"
        >
          {t("salesPageTitle")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed mb-10"
        >
          {t("salesPageSubtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center gap-4"
        >
          <div className="flex -space-x-2 rtl:space-x-reverse overflow-hidden">
             {[1,2,3].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full ring-2 ring-neutral-900 bg-neutral-800 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary/60" />
                </div>
             ))}
          </div>
          <p className="text-neutral-500 text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            {isRtl ? "متاح حالياً" : "Active now"}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
